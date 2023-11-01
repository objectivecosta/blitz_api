import Database from "bun:sqlite";
import Entry from "../model/entry";
import moment from "moment";

class DatabaseHolder {
    database!: Database

    constructor(path: string) {
        this.database = new Database(path);    
    }
}

interface MetaResult {
    totalPayload: number,
    totalPacketSize: number,
}

interface DateResult {
    date: string,
    entries: Array<Entry>,
    meta: MetaResult,
}

export default class Store {
    databaseHolder!: DatabaseHolder;

    constructor(path: string) {
        this.databaseHolder = new DatabaseHolder(path);
    }

    // This below is not the way to do it. Just for PoC.
    // TODO: (objectivecosta) Refactor this.
    buildQuerySegmentForIn(fieldName: string, list: string[]): string {
        let list_string = list.map((s) => `'${s}'`).join(', ');
        return `${fieldName} IN (${list_string})`;
    }
    
    buildQuerySegmentForEqual(fieldName: string, target: string): string {
        return `${fieldName} = '${target}'`;
    }

    buildQuerySegmentForLike(fieldName: string, target: string): string {
        return `${fieldName} LIKE '${target}'`;
    }

    filterBySourceDns(sourceDns: string) {
        return this.buildQuerySegmentForEqual(`from_dns`, sourceDns);
    }

    filterBySourceDnsLike(sourceDns: string) {
        return this.buildQuerySegmentForLike(`from_dns`, sourceDns);
    }

    filterBySourceIp(source_ip: string) {
        return this.buildQuerySegmentForEqual(`from_ip`, source_ip);
    }

    filterBySourceIpLike(source_ip: string) {
        return this.buildQuerySegmentForLike(`from_ip`, source_ip);
    }

    filterByTargetDns(targetDns: string) {
        return this.buildQuerySegmentForEqual(`to_dns`, targetDns);
    }

    filterByTargetDnsLike(targetDns: string) {
        return this.buildQuerySegmentForLike(`to_dns`, targetDns);
    }

    filterByTargetIp(targetIp: string) {
        return this.buildQuerySegmentForEqual(`to_ip`, targetIp);
    }

    filterByTargetIpLike(targetIp: string) {
        return this.buildQuerySegmentForLike(`to_ip`, targetIp);
    }

    combineAndConditions(...conditions: string[]): string {
        return conditions.join(' AND ');
    }

    combineOrConditions(...conditions: string[]): string {
        return conditions.join(' OR ');
    }

    async queryWithParameters(start_date: string, end_date: string, conditions: string): Promise<Array<DateResult>> {
        let start_date_parsed = moment(start_date);
        let end_date_parsed = moment(end_date);
        let days_between = end_date_parsed.clone().diff(start_date_parsed, "days");

        let statements = [];
        let dates: Array<string> = [];
        
        for (let day = 0; day < days_between; day++) {
            const date = start_date_parsed.clone().add(day, 'days');
            const date_string = date.format('YYYYMMDD');
            let tableName = `traffic_${date_string}`;

            dates.push(date_string);
            
            try {
                let string = `SELECT * FROM ${tableName} WHERE ${conditions}`;
                let statement = this.databaseHolder.database.query(string);
                statements.push(statement);
                console.log(`Statement for table: ${tableName}: ${string}`);
            } catch {
                statements.push(null);
                console.log(`Error preparing statement for table: ${tableName}. Table may be missing.`);
            }
        }

        let results: Array<DateResult> = statements.map((s, i) => {
            if (s === null) {
                // No statement. Push empty values...
                return {
                    date: dates[i],
                    entries: [],
                    meta: {
                        totalPayload: 0,
                        totalPacketSize: 0
                    }
                }
            }

            let entries = s.all().map((entry) => entry as Entry);
            return {
                date: dates[i],
                entries: entries,
                meta: {
                    totalPayload: entries.map((e) => e.payload_size).reduce((prev, curr) => {
                        return prev + curr;
                    }, 0),
                    totalPacketSize: entries.map((e) => e.packet_size).reduce((prev, curr) => {
                        return prev + curr;
                    }, 0)
                }
            }
        })

        return results;
    }
};