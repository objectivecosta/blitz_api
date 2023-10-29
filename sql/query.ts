import Database from "bun:sqlite";
import Entry from "../model/entry";
import moment from "moment";

// const db = new Database(":memory:");
// const query = db.query("select 'Hello world' as message;");
// query.get(); // => { message: "Hello world" }

class Query {
    connection_map!: Map<string, Database>;

    constructor() {
        this.connection_map = new Map();
    }

    _containsForDate(date: string): boolean {
        return this.connection_map.has(date);
    }

    async queryWithParameters(start_date: string, end_date: string, query: string): Promise<Entry> {
        let start_date_parsed = moment(start_date);
        let end_date_parsed = moment(end_date);
        let days_between = end_date_parsed.clone().subtract(start_date).days();
        
        for (let day = 0; day < days_between; day++) {
            const date = start_date_parsed.clone().add(day, 'days');
            const date_string = date.format('YYYYMMDD');

            if (this._containsForDate(date_string)) {
                // We already have a connection for that date.
                // TODO: (objectivecosta) Parse on existing connection for that date.
            } else {
                // We DON'T have a connection for that date.
                // TODO: (objectivecosta) Create connection for that date.
            }
        }

        return new Entry();
    }
};