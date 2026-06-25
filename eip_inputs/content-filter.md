# 1. Use case summary

A receiver may get a message that is larger or more deeply nested than it needs. The **Content Filter** pattern simplifies that message by removing unimportant data items and leaving only the items the receiver cares about; it can also simplify tree-like messages with nested or repeating groups. ([Enterprise Integration Patterns][1])

# 2. Solutions

**Relevant modules/connectors:** the core pattern is mainly language-level transformation. Use `ballerina/data.jsondata` when the input is JSON and you want type-safe JSON-to-record projection; use `ballerina/http` only when exposing the filter as an HTTP endpoint. ([Ballerina Central][2])

## Solution 1: Closed target records + Data Mapper mapping

### Summary

Use this when the filter must **rename, flatten, combine, or reshape fields** while dropping the rest. Define a large source record and a smaller closed target record, then construct only the target fields. Ballerina records describe fields separately, closed records allow only the described fields, and mapping constructors create the filtered output value. ([Ballerina][3])

The Visual Data Mapper is a good fit because UI mappings generate Ballerina source, and the source remains the single source of truth. ([Ballerina][4])

### UI steps

1. Open the entry point/function in the flow designer and add a **Statement → Map Data** step; the WSO2 Integrator flow designer supports nodes such as **Declare Variable**, **Call Function**, and **Map Data**. ([GitHub][5])
2. Define or import the source record and a smaller target record. The Data Mapper lets you select existing records, create records, or import JSON to create matching record types. ([Ballerina][4])
3. Map only the needed source fields to the target fields. Leave unwanted source fields unmapped. For arrays, convert the array mapping to a query and map only the required element fields. ([Ballerina][4])

### Ballerina source

```ballerina
import ballerina/http;

public type IncomingOrder record {|
    string orderId;
    Customer customer;
    OrderItem[] items;
    Payment payment;
    Audit audit;
|};

public type Customer record {|
    string id;
    string name;
    string email;
    string phone;
|};

public type OrderItem record {|
    string sku;
    string description;
    int quantity;
    decimal unitPrice;
    string warehouse;
|};

public type Payment record {|
    string paymentToken;
    decimal authorizedAmount;
|};

public type Audit record {|
    string createdBy;
    string createdAt;
    string internalTraceId;
|};

public type FilteredOrder record {|
    string orderId;
    string customerId;
    LineItem[] items;
|};

public type LineItem record {|
    string sku;
    int quantity;
|};

service /orders on new http:Listener(8080) {
    resource function post filter(@http:Payload IncomingOrder order)
            returns FilteredOrder {
        return filterOrder(order);
    }
}

function filterOrder(IncomingOrder order) returns FilteredOrder => {
    orderId: order.orderId,
    customerId: order.customer.id,
    items: from OrderItem item in order.items
           select {
               sku: item.sku,
               quantity: item.quantity
           }
};
```

## Solution 2: JSON projection with `data.jsondata` and closed records

### Summary

Use this when the input is raw JSON and the desired output has the **same general structure**, but with extra fields removed. The `ballerina/data.jsondata` module supports JSON-to-typed-record conversion and projection, and its docs specifically describe selective conversion into closed records when extra JSON members are not needed. ([Ballerina Central][2])

This is best for “drop extra fields” filtering. For renaming, flattening, or combining fields, use Solution 1. Field-name differences can be handled with `@jsondata:Name`. ([GitHub][6])

### UI steps

1. In **Types**, create/import the smaller closed target record. The Integrator JSON docs describe defining a target record type through the Types sidebar/import panel. ([GitHub][6])
2. Add a **Declare Variable** step with the target type and use `check jsondata:parseAsType(payload)`. The docs show this same parse-as-type flow for JSON-to-record transformation. ([GitHub][6])
3. Return or forward the filtered typed value.

### Ballerina source

```ballerina
import ballerina/data.jsondata;
import ballerina/http;

public type PublicOrder record {|
    string orderId;
    PublicCustomer customer;
    PublicItem[] items;
|};

public type PublicCustomer record {|
    string id;
    string name;
|};

public type PublicItem record {|
    string sku;
    int quantity;
|};

service /orders on new http:Listener(8081) {
    resource function post project(@http:Payload json payload)
            returns PublicOrder|error {
        PublicOrder filtered = check jsondata:parseAsType(payload);
        return filtered;
    }
}
```

## Solution 3: Query expressions for nested/repeating groups

### Summary

Use this when the content filter must work inside an array or repeating group: for example, keep only shippable items and project each item to a smaller shape. Ballerina query expressions provide SQL-like `from`, `where`, and `select` clauses for readable collection transformations. ([Ballerina][7])

This is usually used inside Solution 1’s record mapping. The Data Mapper can also convert array mappings into queries and supports clauses such as `where`, `let`, `limit`, `order by`, and joins. ([Ballerina][4])

### UI steps

1. In the Data Mapper, map the input array to the output array.
2. Use the array mapping’s code action to **Convert to query**.
3. Add a `where` clause for element-level filtering and map only the output element fields.

### Ballerina source

```ballerina
public type IncomingLine record {|
    string sku;
    int quantity;
    string warehouse;
    boolean shippable;
|};

public type PublicLine record {|
    string sku;
    int quantity;
|};

function filterLines(IncomingLine[] lines) returns PublicLine[] =>
    from IncomingLine line in lines
    where line.shippable && line.quantity > 0
    select {
        sku: line.sku,
        quantity: line.quantity
    };
```

**Recommended default:** use **Solution 1** for most Content Filter implementations, because it explicitly defines the smaller output contract and handles flattening, renaming, and nested array filtering in one place.

[1]: https://www.enterpriseintegrationpatterns.com/patterns/messaging/ContentFilter.html "Content Filter - Enterprise Integration Patterns"
[2]: https://central.ballerina.io/ballerina/data.jsondata/latest "data.jsondata(v1.1.3) - Ballerina Central"
[3]: https://ballerina.io/spec/lang/master/ "Ballerina Language Specification"
[4]: https://ballerina.io/learn/vs-code-extension/implement-the-code/data-mapper/ "Data Mapper - The Ballerina programming language"
[5]: https://github.com/wso2/docs-integrator/blob/main/en/docs/develop/design-logic/visual-flow-designer.md "docs-integrator/en/docs/develop/design-logic/visual-flow-designer.md at main · wso2/docs-integrator · GitHub"
[6]: https://github.com/wso2/docs-integrator/blob/main/en/docs/develop/transform/json.md "docs-integrator/en/docs/develop/transform/json.md at main · wso2/docs-integrator · GitHub"
[7]: https://ballerina.io/learn/data/ "Data - The Ballerina programming language"
