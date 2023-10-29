import Database from "bun:sqlite";
import Entry from "../model/entry";
import moment from "moment";

// const db = new Database(":memory:");
// const query = db.query("select 'Hello world' as message;");
// query.get(); // => { message: "Hello world" }

class DatabaseHolder {
    database!: Database

    constructor(path: string) {
        this.database = new Database(path);    
    }
}

class Query {
    databaseHolder!: DatabaseHolder;

    constructor() {
        this.databaseHolder = new DatabaseHolder('./db.sqlite');
    }

    async queryWithParameters(start_date: string, end_date: string, conditions: string): Promise<Entry> {
        let start_date_parsed = moment(start_date);
        let end_date_parsed = moment(end_date);
        let days_between = end_date_parsed.clone().subtract(start_date).days();

        let statements = [];
        
        for (let day = 0; day < days_between; day++) {
            const date = start_date_parsed.clone().add(day, 'days');
            const date_string = date.format('YYYYMMDD');
            let tableName = `traffic_${date_string}`;
            let statement = this.databaseHolder.database.query(`SELECT * FROM ${tableName} WHERE ${conditions}`);
            statements.push(statement)
        }

        let results = statements.map((s) => s.all());

        return new Entry();
    }
};