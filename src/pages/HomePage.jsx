import React, { useState } from "react";
import InvoiceForm from "../components/InvoiceForm";
import InvoicePreview from "../components/InvoicePreview";
import "../styles.css";

const HomePage = () => {
  const [invoiceData, setInvoiceData] = useState(null);

  return (
    <div className="container">
      <div className="app-header">
        <img
          src={require("../assets/logoringnet.png")}
          alt="Ringnet"
          className="logo-ringnet"
        />
        <h1>Ringnet - Internet Service Provider</h1>
      </div>

      {!invoiceData ? (
        <InvoiceForm onPreview={(data) => setInvoiceData(data)} />
      ) : (
        <InvoicePreview
          data={invoiceData}
          onReset={() => setInvoiceData(null)}
        />
      )}
    </div>
  );
};

export default HomePage;
