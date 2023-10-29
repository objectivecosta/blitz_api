import { Database } from "bun:sqlite";

export default class Entry {
    timestamp!: number;
    from_ip!: string;
    from_dns!: string; 
    to_ip!: string;
    to_dns!: string;
    packet_size!: number;
    payload_size!: number
}
