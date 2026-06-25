# **Enterprise Legacy Modernization: Wrapping Core Systems with Cloud-Native API Facades and Real-Time Event Streams**

## **1\. Use case summary**

Large-scale enterprises depend heavily on on-premise legacy systems to run core operations. These systems include transactional mainframe databases, terminal services, traditional file servers, message queues, and monolithic web services. While these backends are stable and store critical systems of record, they are not designed to natively communicate with elastic, decentralized cloud architectures. Cloud platforms, mobile frontends, and Software-as-a-Service (SaaS) environments rely on lightweight, resource-oriented RESTful APIs, high-velocity GraphQL schemas, and real-time asynchronous event channels.

Legacy modernization addresses the challenge of making core systems accessible to cloud consumers without executing risky, high-cost rewrites of underlying business logic. The integration boundary in this use case connects private, on-premise infrastructure with hybrid or public cloud environments. Typical systems involved in this architectural pattern include:

* On-premise Relational Database Management Systems (RDBMS).  
* Monolithic Enterprise Resource Planning (ERP) engines.  
* Central Message-Oriented Middleware (MOM) brokers.  
* Traditional file transfer systems (FTP and SFTP).  
* Public cloud Customer Relationship Management (CRM) tools.  
* Elastic modern web applications.

The expected outcome of this pattern is a decoupled, modern API facade layer. This layer abstracts legacy protocols and handles transformation, security mapping, and transaction boundaries. It exposes secure, scalable, and responsive RESTful endpoints or message streams to the cloud, allowing legacy backends to operate safely within their original operational parameters.

## ---

**2\. Enterprise problems**

Exposing legacy architectures directly to cloud networks introduces significant operational, structural, and security challenges:

* **Incompatible Communication Protocols and Data Formats:** Legacy applications frequently communicate using binary payloads, heavy XML protocols (such as SOAP), or unstructured flat files. Translating these formats into lightweight formats like JSON required by modern applications demands substantial processing. This translation can increase latency and CPU consumption on core legacy servers.  
* **Scale and Concurrency Mismatches:** Cloud applications generate highly concurrent, unpredictable web traffic. Legacy database engines, batch systems, and message queues operate on fixed resource models. They cannot scale dynamically to handle sudden spikes in traffic. Direct, unthrottled access from cloud clients can quickly lead to thread pool exhaustion, memory crashes, and cascading failures in core systems.  
* **Distributed Transactions and State Consistency:** Legacy business workflows often require transactional guarantees. Modern distributed microservices favor eventual consistency or asynchronous orchestration over strict two-phase commit (XA) protocols.1 Bridging transactional legacy boundaries with stateless cloud APIs without corrupting database states or losing messages remains a major architectural challenge.  
* **Cryptographic and Security Protocol Gaps:** Cloud-native ecosystems use token-based authentication (OAuth 2.0, OpenID Connect) over standard Transport Layer Security (TLS). Legacy web services rely on complex WS-Security (WSS) standards, requiring XML digital signatures, certificate-based encryption (X.509), and exact timestamp validation.3 Performing these cryptographic operations on legacy servers adds significant processing overhead.  
* **Synchronous Processing of Batch Data:** Core backend operations often rely on batch file deposits (SFTP/FTP) containing thousands of records.5 Directly reading these large files into memory over synchronous HTTP interfaces can saturate memory pools and cause long garbage collection pauses. This can lead to timeouts for concurrent API consumers.

The table below contrasts the operational characteristics of legacy systems with cloud-native architectures:

| Architectural Metric | On-Premise Legacy Systems | Cloud-Native & SaaS Applications |
| :---- | :---- | :---- |
| **Primary Protocols** | SOAP, Native TCP/IP, RFC, SFTP, IBM MQ 4 | REST (HTTP/S), GraphQL, WebSockets, gRPC, CometD 8 |
| **Payload Structures** | Heavy XML (with WS-Security), Flat CSVs, Binary 3 | Highly optimized JSON, Protocol Buffers 9 |
| **Scale Mechanism** | Scale-up (Hardware provisioning), Fixed Thread Pools 10 | Elastic horizontal scaling, Reactive/Event-Driven Concurrency |
| **Security Standards** | WS-Security, Username/Timestamp Tokens, Client Certificates 4 | OAuth 2.0, OpenID Connect, JWT, Mutual TLS |
| **Transaction Pattern** | Strict Local/Distributed Transactions (2PC, XA) 1 | Eventual Consistency, Saga Pattern, Local Transaction Blocks |

## ---

**3\. Solution approach**

The Ballerina programming language acts as an integration-focused cloud-native language. It runs on the Java Virtual Machine (JVM) and provides specialized standard libraries, built-in network concurrency models, and connector packages hosted on Ballerina Central. These capabilities help simplify legacy modernization.

### **SOAP and WS-Security Facade Layer**

To expose legacy SOAP-based web services as modern REST endpoints, the language provides the ballerina/soap module.4 To avoid manually writing type-mapping logic, developers use the Ballerina WSDL tool (bal wsdl).12 This tool parses legacy WSDL files and automatically generates strongly typed client stubs and record structures.12

Bash

\# Code command to automatically compile a legacy WSDL into target Ballerina modules  
$ bal wsdl legacy\_service.wsdl \--module legacy\_service

The generated code exposes clean client interfaces that handle the creation of SOAP envelopes, headers, and body elements automatically.3 For secured legacy endpoints, the client supports outbound and inbound security configurations.3 These configurations apply security profiles like Username Tokens, Timestamp Tokens, and asymmetric cryptography using X.509 certificates.3

Code snippet

import ballerina/crypto;  
import ballerina/soap;  
import ballerina/soap.soap12;

// SOAP Client initialization with outbound XML signature and encryption  
soap12:Client soapClient \= check new ("https://legacy-banking-service/ws", {  
    outboundSecurity: {  
        signatureConfig: {  
            keystore: {  
                path: "/path/to/keystore.jks",  
                password: "keystorePassword"  
            },  
            privateKeyAlias: "client\_alias",  
            privateKeyPassword: "keyPassword",  
            canonicalizationAlgorithm: soap:C14N\_EXCL\_OMIT\_COMMENTS,  
            digestAlgorithm: soap:SHA256  
        }  
    }  
});

### **Relational Database Connectivity and Parameterization**

Legacy RDBMS systems are accessed via the ballerinax/java.jdbc module or database-specific packages like ballerinax/mysql.13 These clients use connection pooling to manage database connections under heavy workloads.10

To protect legacy databases from SQL injection, the ballerina/sql module requires the use of parameterized queries.10 The runtime translates these queries into safe PreparedStatement executions on the target database.10

Code snippet

import ballerina/sql;  
import ballerinax/java.jdbc;

// Establish database client with customized connection pool configurations  
jdbc:Client dbClient \= check new (  
    url \= "jdbc:mysql://localhost:3306/legacy\_db",  
    connectionPool \= { maxOpenConnections: 25, minIdleConnections: 5 }  
);

// Secure parameterized execution preventing SQL-injection vulnerabilities  
int limitValue \= 100;  
sql:ParameterizedQuery selectQuery \= \`SELECT id, balance FROM accounts WHERE balance \> ${limitValue}\`;

Furthermore, the bal persist tool allows developers to model backend schemas natively.17 It can automatically generate structured database access clients during compilation to speed up data access.17

### **Enterprise Resource Planning (ERP) Integration**

Legacy ERP systems, such as SAP, are integrated using two distinct approaches:

* **ballerinax/sap**: Connects to S/4HANA OData REST endpoints, featuring built-in CSRF token retrieval and lifecycle management.18  
* **ballerinax/sap.jco**: Connects to legacy SAP instances using the SAP Java Connector (JCo).7 This connector requires including sapjco3.jar and sapidoc3.jar as compile-time dependencies in Ballerina.toml.7 The native libraries (sapjco3.dll, libsapjco3.so, or libsapjco3.jnilib) must also be available on the system library path at runtime.7

Using sap.jco, developers can execute Remote Function Calls (RFC), send IDocs with customized transaction IDs for end-to-end idempotency, and listen for incoming IDoc event streams.7

Code snippet

import ballerinax/sap.jco;

// DestinationConfig loaded from Config.toml properties  
configurable jco:DestinationConfig sapConfig \=?;

public function main() returns error? {  
    jco:Client jcoClient \= check new (sapConfig);  
    // Execute a Remote Function Module natively mapped with Record types  
    jco:ExportParams result \= check jcoClient-\>execute("RFC\_GET\_CUSTOMER\_INFO", {  
        importParameters: { "CUSTOMER\_ID": 10293 }  
    });  
}

The table below lists the essential connection parameters required by the sap.jco connector 7:

| Parameter Name | Configuration Identifier | Purpose |
| :---- | :---- | :---- |
| **Application Host** | ashost | Hostname or IP of the SAP Application Server 7 |
| **System Number** | sysnr | Two-digit system identifier of the SAP instance 7 |
| **Client ID** | jcoClient | Logical client partition within the SAP system (e.g., "100") 7 |
| **User Name** | user | SAP system user account credentials 7 |
| **Gateway Host** | gwhost | Gateway hostname used for listening to incoming IDocs 7 |
| **Program ID** | progid | Registered RFC destination identifier for IDoc listeners 7 |

### **Messaging Integration (IBM MQ & JMS)**

Integration with enterprise message brokers is supported by the ballerinax/ibm.ibmmq and ballerinax/java.jms connectors.6

The IBM MQ connector connects directly to local or cloud-hosted IBM MQ instances.6 It supports message selection, SSL/TLS security with cipher suites, and custom MQIIH and MQRFH2 headers.6

The generic JMS library allows developers to connect to standard brokers using JNDI connection factories and manage transactional boundaries across messaging systems.19

Code snippet

import ballerinax/java.jms;

// Initialize a JMS connection via ActiveMQ JNDI initial context  
jms:Connection jmsConn \= check new (  
    initialContextFactory \= "org.apache.activemq.jndi.ActiveMQInitialContextFactory",  
    providerUrl \= "tcp://localhost:61616"  
);  
jms:Session jmsSession \= check jmsConn-\>createSession();  
jms:MessageProducer orderProducer \= check jmsSession.createProducer({  
    'type: jms:QUEUE,  
    name: "order-queue"  
});

### **High-Performance File Handling (FTP & SFTP)**

Modernizing file-based integrations is supported by the ballerina/ftp standard library.5 The ftp:Listener monitors directories for file additions or deletions.5 It can use specific filename patterns and coordinates with multiple listener instances in distributed deployments to prevent duplicate file processing.5

The client interface supports streaming file reads and writes using non-blocking byte-block streams.5 This allows the application to process large files without loading the entire content into memory.5

Code snippet

import ballerina/ftp;  
import ballerina/io;

// SFTP client configuration with automated retry logic  
ftp:Client sftpClient \= check new ({  
    protocol: ftp:SFTP,  
    host: "sftp.legacy-system.com",  
    port: 22,  
    auth: {  
        credentials: { username: "ftp\_user", password: "ftp\_password" }  
    },  
    retryConfig: { count: 3, interval: 5.0 }  
});

To assist with system recovery and error handling, the library defines a structured error hierarchy 5:

ftp:Error (Base Library Error)  
 ├── ftp:ConnectionError (Network failures, host unreachable)  
 ├── ftp:FileNotFoundError (Resource missing on remote path)  
 ├── ftp:FileAlreadyExistsError (Duplicate entity validation)  
 ├── ftp:InvalidConfigError (Invalid credentials, key parsing issues)  
 └── ftp:ServiceUnavailableError (Transient endpoint locks \- triggers retry/circuit-breaking)

### **High-Velocity Payload Transformation and Language Features**

When modernizing integrations, converting heavy XML payload formats into JSON is a common requirement. Ballerina includes native XML and JSON data types directly in its type system.

To extract data from complex structures, developers can use the ballerina/data.jsondata package.9 This package supports JSONPath navigation queries, dynamic payload prettification, and projecting large datasets onto smaller, closed record structures.9

Code snippet

import ballerina/data.jsondata;

type CompactUser record {|  
    string username;  
    string department;  
|};

public function main() returns error? {  
    json legacyRawPayload \= {  
        "username": "E\_01923",  
        "department": "Engineering",  
        "meta": { "lastLogin": "2026-05-17T23:00:00Z", "terminalId": "T-80" }  
    };  
      
    // Dynmically project only the needed fields into the record structure  
    CompactUser user \= check jsondata:parseAsType(legacyRawPayload);  
}

### **Architectural Gaps**

While Ballerina provides extensive integration capabilities, certain architectural gaps should be noted:

* **Gap: JDBC Threading Synchronicity Constraints:** Although Ballerina uses a non-blocking asynchronous I/O model, the underlying java.jdbc module depends on the standard Java Database Connectivity (JDBC) API.13 This API is inherently blocking. Under high database workloads, the system must allocate additional OS threads to handle blocking JDBC calls, which can affect performance during high-volume operations.10  
* **Gap: XA/2PC Transaction Interoperability in Distributed Environments:** Ballerina includes built-in syntax for transaction blocks and local SQL/JMS transactions.14 However, coordinating distributed XA two-phase commit transactions across multiple distinct microservices or different database engines can run into driver-level limitations.21 For example, legacy MySQL drivers have exhibited limitations during identical-server transactions, which may require developers to implement alternative pattern strategies, such as the Saga pattern, to maintain consistency.21  
* **Gap: Configuration Case Sensitivity and Driver Imports:** Connecting to database clients requires importing the driver platform module explicitly (e.g., import ballerinax/mysql.driver as \_;).22 Configuration properties defined in the system's Config.toml are strictly case-sensitive.22 Mismatched casing between system properties and application variables can lead to runtime database connection failures.22

## ---

**4\. Scenarios**

The following scenarios demonstrate legacy integration patterns across various industry domains.

### **Scenario A: Banking Core Account Service (REST to Secured SOAP Web Service)**

A financial institution needs to expose its on-premise SOAP core banking system as a modern REST API to support a mobile banking application. The legacy SOAP system requires incoming requests to carry an outbound asymmetric signature based on an X.509 certificate to verify authenticity.3

  \+-----------------------+              \+------------------------+              \+------------------------+  
  |  Mobile Application   | \===(HTTP)==\> |  Ballerina API Proxy   | \===(SOAP)===\> | Legacy Banking Backend |  
  | (REST/JSON balanced)  |              | (REST-to-SOAP Engine)  |              |   (WSS-Secured SOAP)   |  
  \+-----------------------+              \+------------------------+              \+------------------------+

The Ballerina service exposes a secure REST resource, maps the incoming JSON payload into XML, applies asymmetric WS-Security signatures, executes the SOAP call, parses the legacy XML response, and returns a clean JSON structure to the mobile app.

Code snippet

import ballerina/http;  
import ballerina/soap;  
import ballerina/soap.soap11;

// Define the namespace corresponding to the legacy banking service  
xmlns "http://banking.legacy.com/accounts" as acc;

type AccountBalanceRequest record {  
    string accountId;  
};

type AccountBalanceResponse record {  
    string accountId;  
    decimal ledgerBalance;  
};

service /accounts on new http:Listener(8080) {

    private final soap11:Client soapClient;

    function init() returns error? {  
        // Initialize the SOAP client using keystores for asymmetric signing  
        self.soapClient \= check new ("https://legacy-banking.internal/AccountService", {  
            outboundSecurity: {  
                signatureConfig: {  
                    keystore: {  
                        path: "keystore/signature\_keystore.p12",  
                        password: "keystorePassword"  
                    },  
                    privateKeyAlias: "proxy\_signing\_key",  
                    privateKeyPassword: "keyPassword",  
                    canonicalizationAlgorithm: soap:C14N\_EXCL\_OMIT\_COMMENTS,  
                    digestAlgorithm: soap:SHA256  
                }  
            }  
        });  
    }

    resource function post balance(@http:Payload AccountBalanceRequest request) returns AccountBalanceResponse|error {  
        // Build the legacy XML structure using native XML templates  
        xml bodyContent \= xml \`\<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"\>  
            \<soap:Body\>  
                \<acc:GetLedgerBalance\>  
                    \<acc:AccountIdentifier\>${request.accountId}\</acc:AccountIdentifier\>  
                \</acc:GetLedgerBalance\>  
            \</soap:Body\>  
        \</soap:Envelope\>\`;

        // Invoke the SOAP web service (SOAP 1.1 requires the SOAPAction header)  
        xml soapResponse \= check self.soapClient-\>sendReceive(bodyContent, "GetLedgerBalanceAction");

        // Parse and extract values from the XML payload using native navigation  
        xml extractedResult \= soapResponse/\*\*/\<acc:BalanceValue\>/\*;  
        string valueStr \= extractedResult.toString();  
        decimal balanceAmount \= check decimal:fromString(valueStr);

        return {  
            accountId: request.accountId,  
            ledgerBalance: balanceAmount  
        };  
    }  
}

### **Scenario B: Automated Retail Inventory Synchronization (IBM MQ Queue to SAP S/4HANA OData)**

A global manufacturing enterprise needs to synchronize automated warehouse transaction events with an SAP S/4HANA ERP instance. Real-time transaction logs are published as byte payloads to an on-premise IBM MQ server, which must update sales order records in SAP.6

  \+-----------------------+              \+------------------------+              \+------------------------+  
  |  Warehouse IBM MQ     | \===(Bytes)=\> |  Ballerina Event Sync  | \===(REST)===\> |      SAP S/4HANA       |  
  | (Real-time Order Msg) |              |  (Message Processing)  |              |    (OData Enterprise)  |  
  \+-----------------------+              \+------------------------+              \+------------------------+

The Ballerina application acts as an event processor. It consumes incoming messages from the IBM MQ queue, extracts the payload details, maps them to a JSON payload, and updates the ERP backend via SAP OData APIs.6

Code snippet

import ballerina/data.jsondata;  
import ballerina/log;  
import ballerinax/ibm.ibmmq;  
import ballerinax/sap;

// Sales Order model matching target SAP schema structures  
type SalesOrderPayload record {  
    string SalesOrderType;  
    string SalesOrganization;  
    string DistributionChannel;  
    string Division;  
    string SoldToParty;  
};

configurable string mqHost \=?;  
configurable string mqChannel \=?;  
configurable string sapHost \=?;

public function main() returns error? {  
    // Initialize connection with the local IBM MQ queue manager  
    ibmmq:QueueManager queueManager \= check new (  
        name \= "QM\_WAREHOUSE",  
        host \= mqHost,  
        port \= 1414,  
        channel \= mqChannel  
    );

    // Open target queue with designated output/input options  
    ibmmq:Queue transactionQueue \= check queueManager.accessQueue("WAREHOUSE\_ORDERS", ibmmq:MQOO\_INPUT\_AS\_Q\_DEF);

    // Instantiate SAP Client with CSRF handling capability  
    sap:Client sapClient \= check new (  
        string \`https://${sapHost}/sap/opu/odata/sap/API\_SALES\_ORDER\_SRV\`,  
        { auth: { username: "SAP\_INTEGRATOR", password: "SAP\_PASSWORD" } }  
    );

    log:printInfo("Asynchronous retail synchronization engine initialized.");

    while true {  
        // Synchronously fetch next event payload from the queue  
        ibmmq:Message? rawMessage \= check transactionQueue-\>get();

        if rawMessage is ibmmq:Message {  
            // Convert byte array payload to a string  
            byte rawBytes \= rawMessage.payload;  
            string messageBody \= check string:fromBytes(rawBytes);

            // Parse and project JSON data to the target Record model  
            json rawJson \= check jsondata:parseString(messageBody);  
            SalesOrderPayload orderRecord \= check jsondata:parseAsType(rawJson);

            // POST the order records to the SAP S/4HANA Sales Order endpoint  
            json sapResponse \= check sapClient-\>/A\_SalesOrder.post(orderRecord);  
            log:printInfo("Inventory sync successfully posted", sapId \= sapResponse.toString());  
        }  
    }  
}

### **Scenario C: Legacy File Ingestion to Cloud CRM (SFTP Batch File Ingestion to Salesforce)**

An international distributor exports customer contact listings as flat CSV files to an on-premise SFTP directory. These contact records must be read, parsed, validated, and loaded into a cloud-hosted Salesforce CRM platform.5

  \+-----------------------+              \+------------------------+              \+------------------------+  
  | Legacy SFTP Directory | \===(Stream)=\>|  Ballerina File Service| \===(REST)===\> |     Salesforce CRM     |  
  |  (Flat CSV Datasets)  |              |   (Streaming & Sync)   |              |  (Customer Management) |  
  \+-----------------------+              \+------------------------+              \+------------------------+

The Ballerina application uses an SFTP file listener configured via standard service annotations.5 It polls the SFTP server, downloads newly deposited CSV files as a non-blocking byte stream, parses the records, and inserts them into Salesforce.8

Code snippet

import ballerina/ftp;  
import ballerina/io;  
import ballerina/log;  
import ballerinax/salesforce;

configurable string sftpHost \=?;  
configurable string sftpUser \=?;  
configurable string sftpPassword \=?;  
configurable string sfClientId \=?;  
configurable string sfClientSecret \=?;  
configurable string sfRefreshToken \=?;

// Secure SFTP listener monitoring designated input directories  
listener ftp:Listener fileListener \= new ({  
    protocol: ftp:SFTP,  
    host: sftpHost,  
    port: 22,  
    auth: { credentials: { username: sftpUser, password: sftpPassword } },  
    path: "/home/uploads/crm\_contacts",  
    fileNamePattern: "contacts\_.\*\\\\.csv"  
});

service on fileListener {

    private final salesforce:Client sfClient;

    function init() returns error? {  
        // Initialize Salesforce Client with standard OAuth credentials  
        self.sfClient \= check new ({  
            baseUrl: "https://enterprise-retail-crm.my.salesforce.com",  
            auth: {  
                clientId: sfClientId,  
                clientSecret: sfClientSecret,  
                refreshToken: sfRefreshToken,  
                refreshUrl: "https://login.salesforce.com/services/oauth2/token"  
            }  
        });  
    }

    remote function onFileChange(ftp:WatchEvent & readonly event, ftp:Caller caller) returns error? {  
        foreach ftp:FileInfo addedFile in event.addedFiles {  
            log:printInfo("Processing newly uploaded contact batch", fileName \= addedFile.name);

            // Fetch the file as a non-blocking byte stream to avoid memory overhead  
            stream\<byte & readonly, io:Error?\> fileStream \= check caller-\>get(addedFile.pathDecoded);

            // Parse the byte stream directly as CSV-delimited columns  
            stream\<string, io:Error?\> csvRecordStream \= io:fileReadCsvFromStream(fileStream);

            check from string columns in csvRecordStream  
                where columns.length() \>= 3  
                do {  
                    // Inject values directly into the cloud CRM contact model  
                    salesforce:CreationResponse|error response \= self.sfClient-\>create("Contact", {  
                        "FirstName": columns,  
                        "LastName": columns,  
                        "Email": columns  
                    });

                    if response is error {  
                        log:printError("Salesforce record ingestion failed", 'error \= response);  
                    } else {  
                        log:printInfo("Contact record created successfully", salesforceId \= response.id);  
                    }  
                };

            // Close the streaming channel to release connections  
            check fileStream.close();

            // Archive the processed file on the SFTP server to prevent re-processing  
            check caller-\>move(addedFile.pathDecoded, "/home/uploads/crm\_archives/" \+ addedFile.name);  
            log:printInfo("Batch processing complete. File archived.", file \= addedFile.name);  
        }  
    }  
}

#### **Works cited**

1. How to work with transactions \- WSO2 Integrator: MI Documentation 4.5.0, accessed May 17, 2026, [https://mi.docs.wso2.com/en/latest/learn/examples/working-with-transactions/](https://mi.docs.wso2.com/en/latest/learn/examples/working-with-transactions/)  
2. Data Integration With Ballerina \- DZone, accessed May 17, 2026, [https://dzone.com/articles/data-integration-with-ballerina](https://dzone.com/articles/data-integration-with-ballerina)  
3. ballerina-platform/module-ballerina-soap \- GitHub, accessed May 17, 2026, [https://github.com/ballerina-platform/module-ballerina-soap](https://github.com/ballerina-platform/module-ballerina-soap)  
4. soap(v2.3.1) \- Ballerina Central, accessed May 17, 2026, [https://central.ballerina.io/ballerina/soap/latest](https://central.ballerina.io/ballerina/soap/latest)  
5. Specification: Ballerina FTP Library \- The Ballerina programming ..., accessed May 17, 2026, [https://ballerina.io/spec/ftp/](https://ballerina.io/spec/ftp/)  
6. ibm.ibmmq(v1.4.4) \- Ballerina Central, accessed May 17, 2026, [https://central.ballerina.io/ballerinax/ibm.ibmmq/latest](https://central.ballerina.io/ballerinax/ibm.ibmmq/latest)  
7. sap.jco(v1.0.0) \- Ballerina Central, accessed May 17, 2026, [https://central.ballerina.io/ballerinax/sap.jco/latest](https://central.ballerina.io/ballerinax/sap.jco/latest)  
8. salesforce(v8.6.3) \- Ballerina Central, accessed May 17, 2026, [https://central.ballerina.io/ballerinax/salesforce/latest](https://central.ballerina.io/ballerinax/salesforce/latest)  
9. 2201.9.0 (Swan Lake) \- The Ballerina programming language, accessed May 17, 2026, [https://ballerina.io/downloads/swan-lake-release-notes/swan-lake-2201.9.0/](https://ballerina.io/downloads/swan-lake-release-notes/swan-lake-2201.9.0/)  
10. sql(v1.19.0) \- Ballerina Central, accessed May 17, 2026, [https://central.ballerina.io/ballerina/sql/latest](https://central.ballerina.io/ballerina/sql/latest)  
11. Send/Receive \- The Ballerina programming language, accessed May 17, 2026, [https://ballerina.io/learn/by-example/soap-client-send-receive/](https://ballerina.io/learn/by-example/soap-client-send-receive/)  
12. WSDL tool \- The Ballerina programming language, accessed May 17, 2026, [https://ballerina.io/learn/wsdl-tool/](https://ballerina.io/learn/wsdl-tool/)  
13. java.jdbc(v1.15.1) \- Ballerina Central, accessed May 17, 2026, [https://central.ballerina.io/ballerinax/java.jdbc/latest](https://central.ballerina.io/ballerinax/java.jdbc/latest)  
14. Atomic transactions \- The Ballerina programming language, accessed May 17, 2026, [https://ballerina.io/learn/by-example/mysql-atomic-transaction/](https://ballerina.io/learn/by-example/mysql-atomic-transaction/)  
15. sql(v0.6.0-alpha9) \- Ballerina Central, accessed May 17, 2026, [https://central.ballerina.io/ballerina/sql/0.6.0-alpha9](https://central.ballerina.io/ballerina/sql/0.6.0-alpha9)  
16. sql(v1.1.0) \- Ballerina Central, accessed May 17, 2026, [https://central.ballerina.io/ballerina/sql/1.1.0](https://central.ballerina.io/ballerina/sql/1.1.0)  
17. Supported data stores \- The Ballerina programming language, accessed May 17, 2026, [https://ballerina.io/learn/supported-data-stores/](https://ballerina.io/learn/supported-data-stores/)  
18. sap(v1.3.1) \- Ballerina Central, accessed May 17, 2026, [https://central.ballerina.io/ballerinax/sap/latest](https://central.ballerina.io/ballerinax/sap/latest)  
19. ballerinax/java.jms Ballerina library, accessed May 17, 2026, [https://central.ballerina.io/ballerinax/java.jms/latest](https://central.ballerina.io/ballerinax/java.jms/latest)  
20. Specification: Ballerina \`java.jms\` Library \- The Ballerina programming language, accessed May 17, 2026, [https://ballerina.io/spec/java.jms/](https://ballerina.io/spec/java.jms/)  
21. XA transactions in Ballerina with mysql \- Stack Overflow, accessed May 17, 2026, [https://stackoverflow.com/questions/51297772/xa-transactions-in-ballerina-with-mysql](https://stackoverflow.com/questions/51297772/xa-transactions-in-ballerina-with-mysql)  
22. How to correctly configure config.toml in Ballerina for MySQL connection? \- Stack Overflow, accessed May 17, 2026, [https://stackoverflow.com/questions/79079222/how-to-correctly-configure-config-toml-in-ballerina-for-mysql-connection](https://stackoverflow.com/questions/79079222/how-to-correctly-configure-config-toml-in-ballerina-for-mysql-connection)  
23. SFTP service \- Receive file \- Ballerina language, accessed May 17, 2026, [https://ballerina.io/learn/by-example/sftp-service-receive-file/](https://ballerina.io/learn/by-example/sftp-service-receive-file/)