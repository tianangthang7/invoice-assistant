"use server";

import { Invoice } from "@/components/invoice-item";
import axios from "axios";
import * as https from "https";

export interface CaptchaEntity {
  key: string;
  captchaText: string;
}

async function checkInvoice(invoiceData: Invoice, captcha: CaptchaEntity) {
  const agent = new https.Agent({
    rejectUnauthorized: false, // This disables certificate validation
  });
  const { key, captchaText } = captcha;
  const url = `https://hoadondientu.gdt.gov.vn:30000/query/guest-invoices?`;
  const firstInvoiceSymbol = invoiceData.invoice_symbol.charAt(0);
  const restInvoiceSymbol = invoiceData.invoice_symbol.slice(1);
  const params = {
    khmshdon: firstInvoiceSymbol,
    hdon: "0" + firstInvoiceSymbol,
    nbmst: invoiceData.tax_code,
    khhdon: restInvoiceSymbol,
    shdon: invoiceData.invoice_number,
    tgtttbso: invoiceData.total_bill,
    cvalue: captchaText,
    ckey: key,
  };
  console.log("params", params);
  const response = await axios.get(url, { params, httpAgent: agent });
  if (response.data && "hdon" in response.data && response.status === 200) {
    return {
      ...invoiceData,
      is_valid: true,
      validity_message: "Invoice is valid",
      validity_checked_at: new Date(),
    };
  } else if (response.status === 200) {
    return {
      ...invoiceData,
      is_valid: false,
      validity_message: "Invoice is invalid",
      validity_checked_at: new Date(),
    };
  }
  return {
    ...invoiceData,
    is_valid: false,
    validity_message: "Error",
    validity_checked_at: new Date(),
  };
}

export async function checkInvoiceValidity(invoice: Invoice) {
  const server_url = process.env.INVOICE_SERVER_URL;
  console.log("server_url :", server_url);
  const captcha = await axios.get(`${server_url}/captcha/generate`);
  console.log("captcha :", captcha.data);
  // const response = await axios.post(`${server_url}/invoice/check`, invoice);
  // const checkedInvoice = response.data.data;
  const checkedInvoice = await checkInvoice(invoice, captcha.data);
  console.log("checkedInvoice :", checkedInvoice);
  return {
    isValid: checkedInvoice.is_valid,
    message: checkedInvoice.validity_message,
    checkedAt: new Date(),
  };
}

export async function saveInvoice(invoice: Invoice) {
  const server_url = process.env.INVOICE_SERVER_URL;
  console.log("server_url :", server_url);
  const response = await axios.post(`${server_url}/invoice/save`, invoice);
  const savedInvoice = response.data.data as Invoice;
  return savedInvoice;
}
