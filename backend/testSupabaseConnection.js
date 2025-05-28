// backend/testSupabaseConnection.js
require('dotenv').config(); // Load environment variables

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("ERROR: SUPABASE_URL or SUPABASE_SERVICE_KEY not found in .env file.");
    console.error("Please ensure your .env file is in the 'backend/' directory and contains these variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
    console.log("Attempting to connect to Supabase...");
    console.log(`Supabase URL: ${supabaseUrl}`);
    console.log(`Supabase Service Key (first 5 chars): ${supabaseServiceKey ? supabaseServiceKey.substring(0, 5) + '...' : 'N/A'}`);

    try {
        // Try to fetch a very simple piece of data, e.g., from the 'orders' table
        // We just want to see if the connection works, not necessarily get data.
        // Using .limit(0) or .limit(1) is efficient.
        const { data, error } = await supabase
            .from('orders') // Replace 'orders' with any table name you know exists
            .select('id')
            .limit(1); // Fetch just one ID to test connection

        if (error) {
            console.error("\n--- SUPABASE CONNECTION TEST FAILED ---");
            console.error("Error details:", error);
            if (error.message.includes("fetch failed")) {
                console.error("\nPossible reasons (TypeError: fetch failed):");
                console.error("1. Incorrect SUPABASE_URL or SUPABASE_SERVICE_KEY in your .env.");
                console.error("2. Your local machine's firewall is blocking outbound connections.");
                console.error("3. Temporary network issue or DNS problem.");
            } else if (error.code === 'PGRST401' || error.message.includes('permission denied') || error.message.includes('Unauthorized')) {
                console.error("\nPossible reason (Authentication/Permission Error):");
                console.error("1. SUPABASE_SERVICE_KEY is incorrect or does not have sufficient permissions.");
            } else {
                console.error("\nAnother error occurred. Check your Supabase dashboard or network.");
            }
        } else {
            console.log("\n--- SUPABASE CONNECTION TEST SUCCESSFUL! ---");
            console.log("Successfully connected to Supabase and fetched data (or confirmed connection).");
            console.log("Fetched data (if any):", data);
            if (data && data.length === 0) {
                console.log("The 'orders' table is empty, but connection was confirmed.");
            }
        }
    } catch (err) {
        console.error("\n--- UNEXPECTED ERROR DURING SUPABASE CONNECTION TEST ---");
        console.error("Please check your internet connection, firewall, or DNS settings.");
        console.error(err);
    }
    process.exit(); // Exit the script after testing
}

testConnection();