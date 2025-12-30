# 📄 PDF Text Drag & Drop Editor

A powerful and user-friendly **PDF editor** built with **React.js** that allows users to upload a PDF, add custom text, drag & drop it onto the PDF, reposition it freely, and finally **download the updated PDF** — all directly in the browser.

---

## 🛠️ Technologies Used

- ⚛️ **React.js** – UI library
- 🧠 **JavaScript (ES6+)** – Core logic
- 🎨 **Tailwind CSS** – Utility-first CSS framework
- 🖐️ **react-dnd** – Drag & drop functionality
- 📄 **pdf-lib** – Modify and export PDFs
- 🧾 **react-pdf-viewer** – PDF rendering
- 🔍 **React Icons** – Icons support
- ⚡ **Vite** – Fast development & build tool

---

## ✨ Features

- 📤 **Upload PDF** – Select and preview any PDF file
- ✍️ **Add Custom Text** – Type text and create a draggable list
- 🖱️ **Drag & Drop Text** – Drop text anywhere on the PDF
- 🔄 **Reposition Text** – Drag text again to adjust placement
- 📍 **Scroll-Fixed Coordinates** – Text stays fixed relative to PDF while scrolling
- 🗑️ **Auto Remove on Drop** – Text is removed from the list once placed on PDF
- 📥 **Download PDF** – Export the final PDF with added text
- 🧼 **Clean UI** – Split layout with editor on right and PDF on left

---

## 🧩 How It Works

1. Upload a PDF file

2. Type text in the input field and press Enter

3. Text appears in the draggable list

4. Drag the text and drop it on the PDF

5. Reposition text as needed

6. Scroll the PDF — text stays aligned correctly

7. Click Download PDF to save the final version

## 📂 Local Development

### 🔧 Getting Started

```bash
git clone https://github.com/ravikant0055/TextOnPDF.git
cd TextOnPDF
npm install
npm start