import React, { useState } from "react";
import InvoiceForm from "../components/InvoiceForm";
import InvoicePreview from "../components/InvoicePreview";

const CreateInvoicePage = () => {
  const [previewData, setPreviewData] = useState(null);

  return (
    <div className="create-invoice-page" style={{ padding: 20 }}>
      {!previewData ? (
        <InvoiceForm onPreview={(data) => setPreviewData(data)} />
      ) : (
        <InvoicePreview
          data={previewData}
          onReset={() => setPreviewData(null)}
        />
      )}
    </div>
  );
};

export default CreateInvoicePage;
