// src/services/pdfGenerator.js
const PDFDocument = require('pdfkit');
const fs = require('fs'); // Node.js File System module, used here to check for logo existence

async function generateInvoicePdf(orders, res) {
    // Basic validation: ensure orders is an array and not empty
    if (!Array.isArray(orders) || orders.length === 0) {
        throw new Error("No orders provided for PDF generation.");
    }

    // Create a new PDF document with standard margins
    const doc = new PDFDocument({ margin: 50 });

    // Pipe the PDF content directly to the HTTP response stream.
    // This allows the browser to receive the PDF as it's being generated.
    doc.pipe(res);

    // Loop through each order to create an invoice page for it
    for (let i = 0; i < orders.length; i++) {
        const order = orders[i];

        // Add a new page for each subsequent order (except the very first one)
        if (i > 0) {
            doc.addPage();
        }

        // --- Company Header (Your Brand Details) ---
        // Path to your logo. Make sure this path is correct relative to where your backend runs.
        // For example, if app.js is in `backend/src`, and logo is in `backend/public`, use './public/adhyaa_logo.png'
        const logoPath = './public/adhyaa_logo.png';
        if (fs.existsSync(logoPath)) { // Check if logo file exists to prevent errors
            doc.image(logoPath, 50, 45, { width: 60 }) // Place logo at x=50, y=45 with 60px width
               .moveDown(0.5); // Move cursor down slightly after logo
        }

        doc.fillColor('#333') // Dark gray text color
           .fontSize(22) // Larger font for company name
           .font('Helvetica-Bold') // Bold font
           .text('ADHYAA PICKLES', 120, 60); // Company name, adjusted x-coordinate for logo

        doc.fontSize(10) // Smaller font for address/contact
           .font('Helvetica') // Regular font
           .text('Your Company Address Line 1', { align: 'right' }) // Right-aligned address
           .text('City, State, PIN CODE', { align: 'right' })
           .text('Email: support@adhyaapickles.com', { align: 'right' })
           .text('Phone: +91-9876543210', { align: 'right' })
           .moveDown(2); // Move cursor down for spacing

        // --- Invoice Header (Title and Document Details) ---
        doc.fontSize(28).font('Helvetica-Bold').fillColor('#555').text('INVOICE', 50, doc.y) // "INVOICE" title
           .fontSize(12).font('Helvetica')
           .fillColor('#000') // Reset color to black
           .text(`Invoice # ${order.order_id}`, { align: 'right' }) // Your custom order ID
           .text(`Date: ${new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, { align: 'right' }) // Formatted date
           .text(`Order ID: ${order.id}`, { align: 'right' }) // Supabase UUID
           .moveDown(2); // Move cursor down for spacing

        // --- Customer and Order Details ---
        const customerInfo = order.customer_info; // Destructure customer information
        const startYDetails = doc.y; // Capture current Y position for alignment

        doc.fontSize(11).font('Helvetica-Bold')
           .text('Bill To:', 50, startYDetails) // "Bill To" label
           .font('Helvetica')
           .text(customerInfo.fullName, 50, startYDetails + 15) // Customer's full name
           .text(customerInfo.address, 50, startYDetails + 30) // Customer's address
           .text(`${customerInfo.city}, ${customerInfo.state} - ${customerInfo.postalCode}`, 50, startYDetails + 45); // City, State, Postal Code

        // Payment and Status on the right side, aligned with customer details
        doc.fontSize(11).font('Helvetica-Bold')
           .text('Payment Method:', 300, startYDetails) // Payment method label
           .font('Helvetica')
           .text(order.payment_method === 'cod' ? 'Cash on Delivery' : 'Razorpay', 300, startYDetails + 15); // Payment method value
        if (order.payment_id) { // Show transaction ID if available (for Razorpay)
            doc.fontSize(11).font('Helvetica-Bold')
               .text('Transaction ID:', 300, startYDetails + 30)
               .font('Helvetica')
               .text(order.payment_id, 300, startYDetails + 45);
        }
        doc.fontSize(11).font('Helvetica-Bold')
           .text('Order Status:', 300, doc.y + 15) // Order status label
           .font('Helvetica')
           .text(order.order_status.toUpperCase().replace(/_/g, ' '), 300, doc.y + 15); // Order status value, formatted

        doc.moveDown(3); // Adjust spacing after details section

        // --- Items Table Header ---
        const tableTop = doc.y; // Y position for the top of the table
        const col1X = 50;   // Product Name
        const col2X = 280;  // Weight
        const col3X = 350;  // Quantity
        const col4X = 420;  // Unit Price
        const col5X = 500;  // Total Price (for item)

        doc.fillColor('#000').font('Helvetica-Bold')
           .text('Product Name', col1X, tableTop)
           .text('Weight', col2X, tableTop, { width: 50, align: 'right' })
           .text('Qty', col3X, tableTop, { width: 30, align: 'right' })
           .text('Unit Price', col4X, tableTop, { width: 60, align: 'right' })
           .text('Total', col5X, tableTop, { width: 60, align: 'right' });

        // Draw a line below the header
        doc.lineWidth(0.5).moveTo(col1X, tableTop + 20).lineTo(doc.page.width - 50, tableTop + 20).stroke();

        // --- Items Table Rows ---
        let itemY = tableTop + 30; // Starting Y position for the first item row
        const rowHeight = 25; // Height allocated for each item row
        doc.font('Helvetica').fontSize(10); // Font for item details

        order.ordered_items.forEach(item => {
            // Calculate unit price and item total. Handle cases where product or pricePerWeight might be missing.
            const unitPrice = item.product?.pricePerWeight?.[item.weight] || item.unitPrice || 0;
            const itemTotal = item.quantity * unitPrice;

            doc.text(item.product?.name || 'N/A', col1X, itemY, { width: 220 }) // Product Name
               .text(`${item.weight}g`, col2X, itemY, { width: 50, align: 'right' }) // Weight
               .text(item.quantity.toString(), col3X, itemY, { width: 30, align: 'right' }) // Quantity
               .text(`₹${unitPrice.toFixed(2)}`, col4X, itemY, { width: 60, align: 'right' }) // Unit Price
               .text(`₹${itemTotal.toFixed(2)}`, col5X, itemY, { width: 60, align: 'right' }); // Item Total
            itemY += rowHeight; // Move to the next line for the next item
        });

        // Draw a line after the last item
        doc.lineWidth(0.5).moveTo(col1X, itemY + 5).lineTo(doc.page.width - 50, itemY + 5).stroke();

        // --- Totals Section ---
        const totalsStartY = itemY + 15; // Starting Y position for totals
        doc.font('Helvetica-Bold').fontSize(10)
           .text('Subtotal:', 380, totalsStartY, { width: 100, align: 'right' })
           .font('Helvetica')
           .text(`₹${order.subtotal.toFixed(2)}`, 480, totalsStartY, { width: 60, align: 'right' });

        if (order.discount_amount > 0) {
            doc.font('Helvetica-Bold')
               .text('Discount:', 380, totalsStartY + 15, { width: 100, align: 'right' })
               .font('Helvetica')
               .fillColor('green') // Green color for discount
               .text(`-₹${order.discount_amount.toFixed(2)}`, 480, totalsStartY + 15, { width: 60, align: 'right' });
            doc.fillColor('#000'); // Reset color to black
        }

        doc.font('Helvetica-Bold')
           .text('Shipping:', 380, totalsStartY + 30, { width: 100, align: 'right' })
           .font('Helvetica')
           .text(`₹${order.shipping_cost.toFixed(2)}`, 480, totalsStartY + 30, { width: 60, align: 'right' });

        doc.font('Helvetica-Bold')
           .text('Taxes:', 380, totalsStartY + 45, { width: 100, align: 'right' })
           .font('Helvetica')
           .text(`₹${order.taxes.toFixed(2)}`, 480, totalsStartY + 45, { width: 60, align: 'right' });

        if (order.additional_fees > 0) {
            doc.font('Helvetica-Bold')
               .text('Additional Fees:', 380, totalsStartY + 60, { width: 100, align: 'right' })
               .font('Helvetica')
               .text(`₹${order.additional_fees.toFixed(2)}`, 480, totalsStartY + 60, { width: 60, align: 'right' });
        }

        // Grand Total Box - Visually highlight the total amount
        const grandTotalY = totalsStartY + 75;
        doc.rect(370, grandTotalY, 180, 30) // Draw a rectangle for the total box
           .fillAndStroke('#f0f0f0', '#ccc'); // Fill with light gray, stroke with a light border

        doc.fillColor('#000').font('Helvetica-Bold').fontSize(14)
           .text('GRAND TOTAL:', 380, grandTotalY + 8, { width: 100, align: 'left' })
           .text(`₹${order.total_amount.toFixed(2)}`, 490, grandTotalY + 8, { width: 60, align: 'right' });

        doc.moveDown(2); // Spacing before footer

        // --- Footer ---
        doc.fontSize(10).font('Helvetica-Oblique')
           .text('Thank you for your business! We appreciate your order.', 50, doc.y + 30, { align: 'center' });
        doc.fontSize(8).font('Helvetica')
           .text('This is a computer generated invoice and does not require a signature.', 50, doc.y + 15, { align: 'center' });

    } // End of forEach order loop

    doc.end(); // Finalize the PDF document. This sends the buffered content to the response.
}

module.exports = { generateInvoicePdf }; // Export the function
