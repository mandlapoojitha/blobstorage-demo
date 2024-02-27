const express = require('express');

const app = express();
app.use(express.json());

const { TableClient, AzureNamedKeyCredential } = require("@azure/data-tables");

const account = "otpdemoacnt";
const accountKey = "9SWgvBpBPLSM393Sf6ek/pPOsWWyjNz3V/3s0Lp0KppKJpGJrm39L6hPOr8DqsZfFBxou6iryKz3+AStx8qwKQ==";
const tableName = "otpdemo";

const credential = new AzureNamedKeyCredential(account, accountKey);
const client = new TableClient(`https://${account}.table.core.windows.net`, tableName, credential);

app.post('/api/',async function  (req, res) {
    const { data } = req.body;
  
        try {
            // await client.upsertEntity(data[0]);
            // console.log("Entity created or updated successfully!");
            // res.send("Updated successfully!");
            const partitionKey = data[0].partitionKey;
            const rowKey = data[0].rowKey;
            const existingEntity = await client.getEntity(partitionKey, rowKey);
            if(existingEntity){
               // res.send("entity already exits")
                client.deleteEntity(partitionKey,rowKey)
                
                await client.upsertEntity(data[0]);
                res.send("Entity deleted successfully! and appended new data")  
            }
            else{
                await client.upsertEntity(data[0]);
                console.log("Entity created or updated successfully!");
                res.send("Updated successfully!");
 
            }
           
        } catch (error) {
            console.error("Error creating or updating entity:", error);
            res.status(500).send("Internal Server Error");
        }
    
    
});


app.post('/api/check-otp', async function (req, res) {
    const { email:partitionKey, rowKey } = req.body;

    try {
        const entity = await client.getEntity(partitionKey, rowKey);
        if (entity) {

            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        console.error("Error checking OTP:", error);
        res.status(500).send("Internal Server Error");
    }


});

app.listen(3000, () => {
    console.log("Listening on 3000");
});