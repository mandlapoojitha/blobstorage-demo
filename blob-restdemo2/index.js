const express = require('express');

const app = express();
app.use(express.json());

const { TableClient, AzureNamedKeyCredential , TableServiceClient } = require("@azure/data-tables");

const account = "otpdemoacnt";
const accountKey = "9SWgvBpBPLSM393Sf6ek/pPOsWWyjNz3V/3s0Lp0KppKJpGJrm39L6hPOr8DqsZfFBxou6iryKz3+AStx8qwKQ==";
const tableName = "otpdemo";

const credential = new AzureNamedKeyCredential(account, accountKey);
const client = new TableClient(`https://${account}.table.core.windows.net`, tableName, credential);
const serviceClient = new TableServiceClient(`https://${account}.table.core.windows.net`, credential);
app.post('/api/', function (req, res) {
    const { data } = req.body;
    async function main() {
        try {
            await client.upsertEntity(data[0]);
            console.log("Entity created or updated successfully!");
            res.send("Updated successfully!");
        } catch (error) {
            console.error("Error creating or updating entity:", error);
            res.status(500).send("Internal Server Error");
        }
    }
    main();
});



app.post('/api/check-otp', async function (req, res) {
    const { partitionKey, rowKey } = req.body;
    console.log(partitionKey,rowKey)
    async function main() {
        try {
            // Retrieve the latest entity for the given partition key
            const filter = `PartitionKey eq '${partitionKey}' and RowKey eq '${rowKey}'`;
            const options = { filter, orderBy: { columnName: 'Timestamp', order: 'desc' } };
            const queryResult = await serviceClient.listTables(options);

            console.log("Query Result:", queryResult);

            if (queryResult && queryResult.length > 0) {
                const latestEntity = queryResult[0];

                // Log the retrieved entity and provided row key for debugging
                console.log("Retrieved Entity:", latestEntity);
                console.log("Provided Row Key:", rowKey);

                // Check if the provided row key matches the latest entity's OTP
                if (latestEntity.OTP === rowKey) {
                    res.json({ success: true });
                } else {
                    res.json({ success: false });
                }
            } else {
                // No entities found for the given partition key and OTP
                console.log("No entities found for Partition Key and Row Key:", partitionKey, rowKey);
                res.json({ success: false });
            }
        } catch (error) {
            console.error("Error checking OTP:", error);
            res.status(500).send("Internal Server Error");
        }
    }

    main();
});


app.listen(3000, () => {
    console.log("Listening on 3000");
});