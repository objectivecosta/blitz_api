import Store from "./sql/store";

const server = Bun.serve({
    port: 3000,
    fetch(request) {
        return new Response("Welcome to Bun!");
    },
});

let store = new Store('./db.sqlite');
let condition1 = store.filterByTargetDnsLike('%google%');
let condition2 = store.filterBySourceIp('192.168.50.2');
let condition = store.combineAndConditions(condition1, condition2);

console.log(`Query condition: ${condition}`);

let abc = await store.queryWithParameters('2023-08-26', '2023-09-12', condition);

console.log(`JSON: ${JSON.stringify(abc)}`);