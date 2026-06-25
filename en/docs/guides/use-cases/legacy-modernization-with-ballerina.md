---
title: Legacy Modernization With Ballerina
description: "Expose legacy systems through secure API facades, message streams, and file integrations without replacing systems of record."
---

import TabItem from '@theme/TabItem';
import {
  PatternImplementationTabs,
} from '@site/src/utils/eipPatternComponents';

# Legacy Modernization With Ballerina

Large enterprises run core operations on systems that were built for stable, controlled environments. These systems manage the data that runs the business across every major function. They are authoritative systems of record that teams depend on to remain consistent and available.

Modern channels need access to the same data and workflows. These consumers send concurrent requests over lightweight protocols, expect compact payloads, and need failures to surface quickly. The interfaces these legacy systems expose were not designed for this class of consumer.

Exposing legacy systems directly to modern consumers creates structural gaps. Many core systems communicate through proprietary protocols and formats that cloud consumers cannot use directly, so each integration point requires custom translation and spreads protocol knowledge across teams.

- Core systems operate on fixed connection pools and local transaction models that were not designed for the unpredictable traffic patterns of web-scale consumers.
- Security protocols widen the gap further: cloud consumers authenticate with tokens, while many legacy services require XML digital signatures, client certificates, and timestamp validation that must be applied correctly for every outbound request.

WSO2 Integrator and Ballerina address this class of problem by providing a typed, integration-focused layer that sits between modern consumers and legacy systems. Ballerina runs on the JVM and treats XML and JSON as first-class data types, so integration code can work with legacy payloads directly without string-based parsing. Its connector ecosystem covers the full range of legacy protocols through packages on Ballerina Central. The integration layer exposes a modern contract to consumers while keeping operational concerns inside a boundary that one team can own and operate.

## Decouple consumer contracts from legacy protocols

The central idea in legacy modernization is that consumers should onboard against a stable modern interface while the integration handles whatever protocol sits behind it. An [HTTP service](/develop/integration-artifacts/service/http/) exposes resource functions that accept typed JSON payloads. Behind that interface, the integration translates, transforms, and delegates to the legacy system through its native protocol.

For SOAP-backed systems, the [WSDL Tool](/develop/tools/integration-tools/wsdl-tool/) closes the gap between a legacy service definition and usable Ballerina types. It parses an existing WSDL file and generates strongly typed client stubs and record structures, so the integration code works with typed operations instead of assembling XML by hand. The generated client handles envelope construction, header insertion, and response parsing; the resource function sees typed parameters and typed return values. For direct ERP connectivity, database access, and other backend protocols, purpose-built connectors provide the same abstraction: the integration code calls a typed client, and the connector manages the protocol boundary.

## Translate payloads at the integration boundary

Ballerina's type system makes payload translation a structural concern rather than a string-processing task. XML and JSON are native data types, so integration code can construct, navigate, and extract from XML structures without parsing libraries.

When mapping between a rich legacy structure and a lean consumer contract, closed record types act as projection targets. The integration assigns only the fields the consumer needs and leaves the rest unbound, keeping the exposed interface stable as the legacy payload evolves over time. Use [JSON processing](/develop/transform/json/) when messages arrive as compact JSON or need to be projected into smaller records for downstream consumers. Use [XML processing](/develop/transform/xml/) when the integration works directly with XML structures throughout the flow.

## Handle event-driven and file-based workloads

Not all legacy integration fits a request-response pattern. File-based workloads typically involve large batch files deposited to a remote directory on a schedule; loading these files into memory over synchronous HTTP interfaces would saturate connection pools and stall concurrent consumers. The [FTP/SFTP integration](/develop/integration-artifacts/file/ftp-sftp/) provides a listener that monitors remote directories for new files matching a pattern and delivers each as a non-blocking byte stream. Processing happens chunk by chunk, so memory use stays proportional to the stream buffer rather than the total file size.

Message-broker workloads follow the same listener model. The [IBM MQ connector](/connectors/catalog/messaging/ibm.ibmmq/ibm-mq-connector-overview/) and [JMS connector](/connectors/catalog/messaging/java.jms/jms-connector-overview/) subscribe to queues and deliver each message to integration logic that maps, transforms, and forwards it downstream. This lets legacy message-broker traffic enter modern event-driven pipelines without a polling script in each consuming application.

## Centralize security and operational controls

The integration layer is where protocol security and operational limits belong, not in the consuming application or the legacy system. When a legacy SOAP endpoint requires WS-Security, the SOAP client configuration applies the certificate-based signature or encryption profile before the request leaves the integration, keeping cryptographic configuration in one place and out of both the consumer and the backend.

Operational settings become configurable variables that teams adjust per environment without modifying integration logic. This means endpoint rotation, certificate renewal, and connection limit tuning are deployment-time operations. Broader [runtime security](/deploy-operate/secure/runtime-security/) controls remain part of the deployment rather than being embedded in business logic.

## Outcome

- Protocol-specific logic moves into one integration service.
- Consumers onboard against a REST contract without learning legacy protocol details.
- Operational settings become configurable variables that teams adjust per environment without changing integration code.
- Failures surface at the integration boundary where they can be observed and retried, rather than propagating into legacy systems or disappearing inside point-to-point connections.
- Batch file workloads and broker-delivered events enter modern downstream pipelines through typed integration logic instead of requiring custom polling scripts or bespoke protocol clients in each consuming application.

## Scenario: Banking core account balance facade

A banking team needs to expose account balance data from an on-premise core banking service to a mobile application. The source system is a SOAP 1.1 service that requires each request to carry an outbound XML signature based on an X.509 certificate. The target consumer is a mobile application that sends a JSON request over HTTP.

The trigger is a `POST /accounts/balance` request containing an `accountId`. The integration maps the JSON request to the SOAP balance operation, applies the WS-Security signature using a configured keystore, calls the core banking service, extracts the ledger balance from the XML response, and returns a JSON response with the account identifier and balance.

<PatternImplementationTabs>
<TabItem value="ui" label="Visual Designer" default>

1. [Create an integration project](/develop/create-integrations/create-a-project) for the banking account facade.
2. Use **Add Artifact** to [create an HTTP service](/develop/integration-artifacts/service/http#creating-an-http-service) and set the service path to `/accounts`.
3. Add a **Resource** with the `POST` method and set the resource path to `/balance`.
4. Define the request payload as a record with an `accountId` field and the response payload as a record with `accountId` and `ledgerBalance` fields.
5. Use the [WSDL Tool](/develop/tools/integration-tools/wsdl-tool/) to generate SOAP client sources from the core banking WSDL, then add the generated sources to the integration project.
6. Add configurable variables for `coreBankingUrl`, `keyStorePath`, `keyStorePassword`, `privateKeyAlias`, and `privateKeyPassword`.
7. In **Design View**, map the incoming `accountId` to the SOAP body XML using XML template literals, referencing the account namespace declared in the generated sources.
8. Initialize the SOAP 1.1 client with the outbound WS-Security signature configuration, supplying the keystore configurable variables as the signature profile.
9. Call `sendReceive` on the SOAP client, navigate the XML response to extract the balance value, and return the typed response record from the `POST /accounts/balance` resource.

</TabItem>
<TabItem value="code" label="Ballerina Code">

```ballerina
import ballerina/http;
import ballerina/soap;
import ballerina/soap.soap11;

xmlns "http://banking.legacy.com/accounts" as acc;

configurable string coreBankingUrl = ?;
configurable string keyStorePath = ?;
configurable string keyStorePassword = ?;
configurable string privateKeyAlias = ?;
configurable string privateKeyPassword = ?;

type AccountBalanceRequest record {|
    string accountId;
|};

type AccountBalanceResponse record {|
    string accountId;
    decimal ledgerBalance;
|};

listener http:Listener api = new (8080);

service /accounts on api {
    private final soap11:Client soapClient;

    function init() returns error? {
        self.soapClient = check new (coreBankingUrl, {
            outboundSecurity: {
                signatureConfig: {
                    keystore: {
                        path: keyStorePath,
                        password: keyStorePassword
                    },
                    privateKeyAlias,
                    privateKeyPassword,
                    canonicalizationAlgorithm: soap:C14N_EXCL_OMIT_COMMENTS,
                    digestAlgorithm: soap:SHA256
                }
            }
        });
    }

    resource function post balance(@http:Payload AccountBalanceRequest request)
            returns AccountBalanceResponse|error {
        xml bodyContent = xml `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
            <soap:Body>
                <acc:GetLedgerBalance>
                    <acc:AccountIdentifier>${request.accountId}</acc:AccountIdentifier>
                </acc:GetLedgerBalance>
            </soap:Body>
        </soap:Envelope>`;

        xml soapResponse = check self.soapClient->sendReceive(bodyContent, "GetLedgerBalanceAction");
        xml extractedResult = soapResponse/**/<acc:BalanceValue>/*;
        decimal balanceAmount = check decimal:fromString(extractedResult.toString());

        return {
            accountId: request.accountId,
            ledgerBalance: balanceAmount
        };
    }
}
```

</TabItem>
</PatternImplementationTabs>
