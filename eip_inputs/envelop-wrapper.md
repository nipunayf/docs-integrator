# 1. Use case summary

Existing systems may need to send ordinary application data through a messaging infrastructure that requires a specific message format, such as required header fields or security-related wrapper data. The **Envelope Wrapper** pattern solves this by wrapping the application payload in an infrastructure-compliant envelope before sending it, then unwrapping it at the destination. ([Enterprise Integration Patterns][1])

# 2. Solutions

## Solution 1 — Typed envelope records + data mapping

### Solution summary

Use **typed records** to model the envelope and the original payload. This is the most direct Ballerina implementation of Envelope Wrapper because the envelope becomes a first-class message type: one field carries infrastructure metadata, and another carries the original business payload.

Use this when the required envelope is a JSON-like business/message contract, such as:

```json
{
  "header": {
    "messageId": "msg-1001",
    "messageType": "OrderCreated",
    "correlationId": "corr-789"
  },
  "payload": {
    "orderId": "O-1001",
    "customerId": "C-500",
    "total": 250.75
  }
}
```

For plain JSON objects, Ballerina records and JSON values are enough. Use `ballerina/data.jsondata` when the JSON comes from a string, byte stream, or needs conversion/projection into typed records; the module supports `parseAsType`, `parseString`, `parseBytes`, and `parseStream`. ([Ballerina Central][2])

### UI steps

1. Create a new integration from the WSO2 Integrator home screen, fill in the integration details, and create the project; the generated project includes files such as `main.bal`, `types.bal`, `functions.bal`, and `data_mappings.bal`. ([GitHub][3])
2. Open **Types** and define records for the business payload and envelope, for example `Order`, `EnvelopeHeader`, and `OrderEnvelope`.
3. Open the relevant service/resource in the **Visual Flow Designer**. The designer lets you compose integration logic as nodes and keeps the visual flow and Ballerina code synchronized. ([GitHub][4])
4. Add a **Declare Variable** or **Map Data** step to create the envelope from the original payload. The WSO2 JSON processing guide uses **Declare Variable** steps and typed JSON/record conversion for this kind of transformation. ([GitHub][5])
5. Add the outbound call or return step using the wrapped message. For the receiving side, accept `OrderEnvelope` and pass only `envelope.payload` to the application logic.

### Ballerina source

```ballerina
import ballerina/http;

type Order record {|
    string orderId;
    string customerId;
    decimal total;
|};

type EnvelopeHeader record {|
    string messageId;
    string messageType;
    string correlationId;
|};

type OrderEnvelope record {|
    EnvelopeHeader header;
    Order payload;
|};

final http:Client backend = checkpanic new ("http://localhost:9091");

function wrapOrder(Order order, string correlationId) returns OrderEnvelope {
    return {
        header: {
            messageId: "msg-" + order.orderId,
            messageType: "OrderCreated",
            correlationId
        },
        payload: order
    };
}

function unwrapOrder(OrderEnvelope envelope) returns Order {
    return envelope.payload;
}

service /wrapper on new http:Listener(9090) {

    // Wrap application data before sending it to the messaging/backend endpoint.
    resource function post orders(
            @http:Payload Order order,
            @http:Header {name: "X-Correlation-Id"} string correlationId = "none")
            returns json|error {

        OrderEnvelope envelope = wrapOrder(order, correlationId);

        // The backend receives the infrastructure-compliant envelope.
        json backendResponse = check backend->post("/orders", envelope);
        return backendResponse;
    }

    // Unwrap infrastructure-compliant data when it arrives.
    resource function post unwrap(@http:Payload OrderEnvelope envelope) returns Order {
        return unwrapOrder(envelope);
    }
}
```

## Solution 2 — XML envelope conversion for XML/SOAP-style infrastructure

### Solution summary

Use **XML construction and XML-to-record conversion** when the messaging infrastructure requires an XML envelope, for example a SOAP-like wrapper or an enterprise XML schema. The key concept is the same: define the application payload separately, wrap it in an envelope shape, and unwrap it on arrival.

Use `ballerina/data.xmldata` when XML needs to be converted into typed records or when records need to be emitted as XML. The module supports XML input as `xml`, string, byte array, or stream, and converts XML into Ballerina records; it also provides `toXml` for record-to-XML conversion. ([Ballerina Central][6])

### UI steps

1. Define the record types in **Types**: payload record, header record, and envelope record.
2. In the flow designer, add a **Declare Variable** step to parse an incoming XML envelope using `check xmldata:parseAsType(payload)`. The WSO2 XML processing guide shows this UI flow for XML-to-record conversion. ([GitHub][7])
3. Use **Visual Data Mapper** to map the parsed envelope payload to the internal application shape, or to map the internal record into an outgoing envelope. The same guide describes using the Visual Data Mapper after XML-to-record conversion. ([GitHub][7])
4. Add another **Declare Variable** or return step with `check xmldata:toXml(envelope)` when the outgoing message must be XML.
5. Use MIME/message entity APIs only when the required envelope is actually multipart or header/body based; the `ballerina/mime` module supports multipart message types and setting/retrieving XML, JSON, text, byte arrays, body parts, and headers. ([Ballerina Central][8])

### Ballerina source

```ballerina
import ballerina/data.xmldata;

type Order record {|
    string orderId;
    string customerId;
    decimal total;
|};

type EnvelopeHeader record {|
    string messageId;
    string messageType;
    string correlationId;
|};

type OrderEnvelope record {|
    EnvelopeHeader header;
    Order payload;
|};

function toXmlEnvelope(Order order, string correlationId) returns xml|error {
    OrderEnvelope envelope = {
        header: {
            messageId: "msg-" + order.orderId,
            messageType: "OrderCreated",
            correlationId
        },
        payload: order
    };

    return check xmldata:toXml(envelope);
}

function fromXmlEnvelope(xml envelopeXml) returns Order|error {
    OrderEnvelope envelope = check xmldata:parseAsType(envelopeXml);
    return envelope.payload;
}
```

## Relevant Ballerina constructs

The core constructs are:

* **Records and JSON/XML values** for representing the envelope and the original payload.
* **Resource methods and HTTP clients** for wrapping/unwrapping at the system boundary. Ballerina’s language specification describes service/client objects and resource methods as the network interaction model for inbound and outbound communication. ([Ballerina][9])
* **`ballerina/data.jsondata`** for typed JSON conversion when the envelope arrives as external JSON text/bytes/streams. ([Ballerina Central][2])
* **`ballerina/data.xmldata`** for XML envelopes and XML-record conversion. ([Ballerina Central][6])
* **`ballerina/mime`** only for MIME/multipart or explicit header/body envelope contracts. ([Ballerina Central][8])

[1]: https://www.enterpriseintegrationpatterns.com/patterns/messaging/EnvelopeWrapper.html "Envelope Wrapper - Enterprise Integration Patterns"
[2]: https://central.ballerina.io/ballerina/data.jsondata/latest "data.jsondata(v1.1.3) - Ballerina Central"
[3]: https://raw.githubusercontent.com/wso2/docs-integrator/main/en/docs/develop/create-integrations/create-a-new-integration.md "raw.githubusercontent.com"
[4]: https://raw.githubusercontent.com/wso2/docs-integrator/main/en/docs/develop/design-logic/visual-flow-designer.md "raw.githubusercontent.com"
[5]: https://raw.githubusercontent.com/wso2/docs-integrator/main/en/docs/develop/transform/json.md "raw.githubusercontent.com"
[6]: https://central.ballerina.io/ballerina/data.xmldata/latest "data.xmldata(v1.6.2) - Ballerina Central"
[7]: https://raw.githubusercontent.com/wso2/docs-integrator/main/en/docs/develop/transform/xml.md "raw.githubusercontent.com"
[8]: https://central.ballerina.io/ballerina/mime/latest "mime(v2.12.1) - Ballerina Central"
[9]: https://ballerina.io/spec/lang/master/ "Ballerina Language Specification"
