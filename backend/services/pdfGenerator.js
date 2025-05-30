// src/services/pdfGenerator.js
const PDFDocument = require('pdfkit');

/**
 * Generates a PDF invoice for one or more orders.
 * If multiple orders are provided, each order will be on a new page.
 *
 * @param {Array<Object>} orders - An array of order objects to generate invoices for.
 * @param {Object} res - The Express response object to pipe the PDF to.
 */
async function generateInvoicePdf(orders, res) {
    const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        autoFirstPage: false // Crucial for bulk printing: we'll add pages explicitly
    });

    // Pipe the PDF directly to the response stream
    doc.pipe(res);

    if (!Array.isArray(orders) || orders.length === 0) {
        doc.fontSize(12).text('No orders provided for invoice generation.', 50, 50);
        doc.end();
        return;
    }

    // --- Helper Functions (nested) ---
    function formatCurrency(amount) {
        if (typeof amount !== 'number') {
            amount = parseFloat(amount) || 0;
        }
        return `₹${amount.toFixed(2)}`; // Assuming Indian Rupees
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        try {
            return new Date(dateString).toLocaleDateString('en-IN', options);
        } catch (e) {
            console.error("Error formatting date:", dateString, e);
            return dateString; // Return original if parsing fails
        }
    }

    function generateHeader(doc, order) {
        const companyName = 'ADHYAA PICKLES';
        const companyAddress = '123 Pickles Lane, Spice City, India'; // Replace with your actual address
        const companyContact = 'Phone: +91 98765 43210 | Email: info@adhyaapickles.com'; // Replace with your actual contact

        // doc.image('path/to/your/logo.png', 50, 45, { width: 50 }) // Uncomment and set path for your logo
        //    .fillColor('#444444');
        doc.fontSize(20)
           .font('Helvetica-Bold')
           .text(companyName, 50, 57)
           .fontSize(10)
           .font('Helvetica')
           .text('INVOICE', doc.page.width - 150, 50, { align: 'right' })
           .fontSize(8)
           .text(`Invoice No: ${order.order_id || 'N/A'}`, doc.page.width - 150, 65, { align: 'right' })
           .text(`Date: ${formatDate(order.created_at)}`, doc.page.width - 150, 75, { align: 'right' })
           .moveDown();

        doc.fontSize(8)
           .text(companyAddress, 50, 80)
           .text(companyContact, 50, 90)
           .moveDown();

        doc.lineWidth(0.5)
           .strokeColor('#aaaaaa')
           .moveTo(50, 110)
           .lineTo(doc.page.width - 50, 110)
           .stroke();
    }

    function generateCustomerInformation(doc, order) {
        const customerInfo = order.customer_info || {};
        const shippingAddress = order.shipping_address || {};

        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text('Bill To:', 50, 130)
           .font('Helvetica')
           .text(customerInfo.fullName || 'N/A', 50, 145)
           .text(customerInfo.email || 'N/A', 50, 160)
           .text(customerInfo.phone || 'N/A', 50, 175)
           .moveDown();

        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text('Ship To:', doc.page.width / 2, 130)
           .font('Helvetica')
           .text(shippingAddress.addressLine1 || 'N/A', doc.page.width / 2, 145)
           .text(`${shippingAddress.city || ''}, ${shippingAddress.state || ''} - ${shippingAddress.pincode || ''}`.trim(), doc.page.width / 2, 160)
           .text(shippingAddress.country || 'India', doc.page.width / 2, 175)
           .moveDown();

        doc.lineWidth(0.5)
           .strokeColor('#aaaaaa')
           .moveTo(50, 195)
           .lineTo(doc.page.width - 50, 195)
           .stroke();
    }

    function generateInvoiceTable(doc, order) {
        const tableTop = 220;
        const itemCol = 50;
        const qtyCol = 350;
        const priceCol = 400;
        const totalCol = 480;

        // Table Headers
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .text('Item', itemCol, tableTop)
           .text('Qty', qtyCol, tableTop, { width: 40, align: 'right' })
           .text('Price', priceCol, tableTop, { width: 60, align: 'right' })
           .text('Total', totalCol, tableTop + 5, { width: 60, align: 'right' });
        doc.moveDown();

        // Line below headers
        doc.lineWidth(0.5).strokeColor('#000000').moveTo(itemCol, tableTop + 15).lineTo(doc.page.width - 50, tableTop + 15).stroke();

        let y = tableTop + 30;
        const items = order.ordered_items || []; // Ensure it's an array

        items.forEach(item => {
            doc.font('Helvetica')
               .text(item.name || 'N/A', itemCol, y, { width: 280 })
               .text(item.quantity || 0, qtyCol, y, { width: 40, align: 'right' })
               .text(formatCurrency(item.price_per_unit || 0), priceCol, y, { width: 60, align: 'right' })
               .text(formatCurrency((item.quantity || 0) * (item.price_per_unit || 0)), totalCol, y, { width: 60, align: 'right' });
            y += 20;

            // Handle new page if content overflows
            if (y > doc.page.height - 150) {
                doc.addPage();
                y = 50; // Reset y for new page
                // Redraw headers on new page
                doc.fontSize(9)
                   .font('Helvetica-Bold')
                   .text('Item', itemCol, y)
                   .text('Qty', qtyCol, y, { width: 40, align: 'right' })
                   .text('Price', priceCol, y, { width: 60, align: 'right' })
                   .text('Total', totalCol, y + 5, { width: 60, align: 'right' });
                doc.lineWidth(0.5).strokeColor('#000000').moveTo(itemCol, y + 15).lineTo(doc.page.width - 50, y + 15).stroke();
                y += 30;
            }
        });

        // Line above totals
        doc.lineWidth(0.5).strokeColor('#000000').moveTo(itemCol, y + 5).lineTo(doc.page.width - 50, y + 5).stroke();

        // Totals Section
        const totalsX = doc.page.width - 200;
        const totalY = y + 20;

        doc.fontSize(10)
           .font('Helvetica')
           .text('Subtotal:', totalsX, totalY, { align: 'right' })
           .text(formatCurrency(order.sub_total || 0), doc.page.width - 50, totalY, { align: 'right' })
           .text('Shipping:', totalsX, totalY + 15, { align: 'right' })
           .text(formatCurrency(order.shipping_cost || 0), doc.page.width - 50, totalY + 15, { align: 'right' })
           .font('Helvetica-Bold')
           .fontSize(12)
           .text('Grand Total:', totalsX, totalY + 40, { align: 'right' })
           .text(formatCurrency(order.total_amount || 0), doc.page.width - 50, totalY + 40, { align: 'right' });
    }

    function generatePaymentDetails(doc, order) {
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .text('Payment Details:', 50, doc.y + 40)
           .font('Helvetica')
           .text(`Method: ${order.payment_method || 'N/A'}`, 50, doc.y + 10)
           .text(`Status: ${order.order_status || 'N/A'}`, 50, doc.y + 10);
        if (order.payment_id) {
            doc.text(`Transaction ID: ${order.payment_id}`, 50, doc.y + 10);
        }
    }

    function generateFooter(doc) {
        doc.fontSize(8)
           .text('Thank you for your business!', doc.page.width / 2, doc.page.height - 50, { align: 'center' })
           .text('This is an auto-generated invoice and does not require a signature.', doc.page.width / 2, doc.page.height - 35, { align: 'center' });
    }
    // --- End Helper Functions ---

    // Iterate through each order to generate its invoice on a new page
    for (let i = 0; i < orders.length; i++) {
        const order = orders[i];

        // Add a new page for each invoice
        doc.addPage();

        // Use the nested helper functions to draw the invoice content
        generateHeader(doc, order);
        generateCustomerInformation(doc, order);
        generateInvoiceTable(doc, order);
        generatePaymentDetails(doc, order);
        generateFooter(doc);

        // Add page numbering for bulk prints (optional but good practice)
        if (orders.length > 1) {
            doc.fontSize(8).text(`Page ${i + 1} of ${orders.length}`, doc.page.width - 100, doc.page.height - 30, { align: 'right' });
        }
    }

    // Finalize the PDF and end the stream
    doc.end();
}

module.exports = {
    generateInvoicePdf,
};
