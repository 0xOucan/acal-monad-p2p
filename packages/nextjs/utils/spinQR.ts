import { keccak256, toBytes } from "viem";

export interface SpinQRData {
  TipoOperacion: string;
  VersionQR: string;
  FechaExpiracionQR: string;
  FechaCreacionQR: string;
  EmisorQR: string;
  Monto: number;
  Concepto: string;
  Operacion: {
    Mensaje: string;
    CR: string;
    Comisiones: string;
    CadenaEncriptada: string;
    Aux1: string;
    Aux2: string;
  };
}

export interface ParsedSpinQR {
  cr: string;
  crHash: `0x${string}`;
  qrHash: `0x${string}`;
  amount: number;
  expiry: Date;
  rawData: SpinQRData;
}

/**
 * Parses SPIN QR code data and generates the required hashes
 * @param qrText - Raw QR code text (JSON string)
 * @param salt - Optional salt for QR hash generation (defaults to current timestamp)
 * @returns Parsed data with generated hashes
 */
export function parseSpinQR(qrText: string, salt?: string): ParsedSpinQR {
  try {
    const qrData: SpinQRData = JSON.parse(qrText);

    // Validate required fields
    if (!qrData.Operacion?.CR || !qrData.Monto || !qrData.FechaExpiracionQR) {
      throw new Error("Invalid SPIN QR format: missing required fields");
    }

    const cr = qrData.Operacion.CR;
    const amount = qrData.Monto;

    // Parse expiry date from Mexican format (DD/MM/YY HH:mm:ss)
    const expiryStr = qrData.FechaExpiracionQR;
    const expiry = parseMexicanDate(expiryStr);

    // Generate CR hash (keccak256 of the CR string)
    const crHash = keccak256(toBytes(cr));

    // Generate QR hash (keccak256 of the full QR JSON + salt)
    const saltToUse = salt || Date.now().toString();
    const qrWithSalt = qrText + saltToUse;
    const qrHash = keccak256(toBytes(qrWithSalt));

    return {
      cr,
      crHash,
      qrHash,
      amount,
      expiry,
      rawData: qrData,
    };
  } catch (error) {
    throw new Error(`Failed to parse SPIN QR: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Parses Mexican date format (DD/MM/YY HH:mm:ss) to JavaScript Date
 * @param dateStr - Date string in Mexican format
 * @returns JavaScript Date object
 */
function parseMexicanDate(dateStr: string): Date {
  // Expected format: "24/12/20 00:00:00" or "25/04/22 00:00:00"
  const parts = dateStr.split(" ");
  if (parts.length !== 2) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }

  const [datePart, timePart] = parts;
  const [day, month, year] = datePart.split("/").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);

  // Handle 2-digit year (assume 20xx for years 00-99)
  const fullYear = year < 100 ? 2000 + year : year;

  return new Date(fullYear, month - 1, day, hour, minute, second);
}

/**
 * Validates if a SPIN QR is still valid (not expired)
 * @param qrData - Parsed SPIN QR data
 * @returns true if valid, false if expired
 */
export function isSpinQRValid(qrData: ParsedSpinQR): boolean {
  return qrData.expiry > new Date();
}

/**
 * Converts MXN amount to MON tokens (1 MXN = 0.01 MON)
 * @param mxnAmount - Amount in MXN
 * @returns Amount in MON (as wei)
 */
export function mxnToMon(mxnAmount: number): bigint {
  // 1 MXN = 0.01 MON = 0.01 * 1e18 wei = 1e16 wei
  return BigInt(mxnAmount) * BigInt("10000000000000000"); // 1e16
}

/**
 * Formats MON amount for display
 * @param monWei - Amount in wei
 * @returns Formatted string
 */
export function formatMonAmount(monWei: bigint): string {
  return (Number(monWei) / 1e18).toFixed(4) + " MON";
}

/**
 * Generates a unique test SPIN QR with 100 MXN
 * @returns A unique test SPIN QR string
 */
export function generateTestSpinQR(): string {
  // Generate unique CR based on timestamp
  const timestamp = Date.now();
  const uniqueCR = `10${timestamp.toString().slice(-10)}007`; // Format: 10XXXXXXXXX007

  // Set expiry to 1 year from now
  const expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + 1);
  const expiryStr =
    expiry
      .toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
      .replace(/\//g, "/") + " 23:59:59";

  // Current date
  const now =
    new Date()
      .toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
      .replace(/\//g, "/") + ` ${new Date().toTimeString().slice(0, 8)}`;

  const testQR = {
    TipoOperacion: "0004",
    VersionQR: "01.01",
    FechaExpiracionQR: expiryStr,
    FechaCreacionQR: now,
    EmisorQR: "101",
    Monto: 100, // Always 100 MXN
    Concepto: "",
    Operacion: {
      Mensaje: "",
      CR: uniqueCR,
      Comisiones: "12",
      CadenaEncriptada: "",
      Aux1: "",
      Aux2: "",
    },
  };

  return JSON.stringify(testQR);
}

/**
 * Example SPIN QR for testing (deprecated - use generateTestSpinQR instead)
 */
export const EXAMPLE_SPIN_QR = `{"TipoOperacion":"0004","VersionQR":"01.01","FechaExpiracionQR":"25/12/25 23:59:59","FechaCreacionQR":"24/08/24 19:15:17","EmisorQR":"101","Monto":100,"Concepto":"","Operacion":{"Mensaje":"","CR":"1018899255004007","Comisiones":"12","CadenaEncriptada":"","Aux1":"","Aux2":""}}`;
