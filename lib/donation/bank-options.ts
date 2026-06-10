export type BankOption = {
  value: string;
  label: string;
  logoUrl: string;
};

export const BANK_OPTIONS: BankOption[] = [
  {
    value: "bsi",
    label: "Bank Syariah Indonesia",
    logoUrl: "/banks/bsi.png",
  },
  {
    value: "bca",
    label: "Bank Central Asia",
    logoUrl: "/banks/bca.png",
  },
  {
    value: "bni",
    label: "Bank Negara Indonesia",
    logoUrl: "/banks/bni.png",
  },
  {
    value: "bri",
    label: "Bank Rakyat Indonesia",
    logoUrl: "/banks/bri.png",
  },
  {
    value: "mandiri",
    label: "Bank Mandiri",
    logoUrl: "/banks/mandiri.png",
  },
  {
    value: "btn_syariah",
    label: "BTN Syariah",
    logoUrl: "/banks/btn-syariah.png",
  },
  {
    value: "muamalat",
    label: "Bank Muamalat",
    logoUrl: "/banks/muamalat.png",
  },
];

export function getBankOptionByValue(value: string) {
  return BANK_OPTIONS.find((item) => item.value === value) ?? null;
}

export function getBankOptionByLabel(label: string) {
  return BANK_OPTIONS.find((item) => item.label === label) ?? null;
}
