"use client";

import { useState, useEffect } from "react";

interface Props {
  name: string;
  value?: number;
  onChange?: (raw: number) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export default function FormattedNumberInput({
  name,
  value,
  onChange,
  placeholder,
  required,
  className = "input-field",
}: Props) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    if (value !== undefined) setDisplay(value.toLocaleString("vi-VN"));
  }, [value]);

  const handleChange = (val: string) => {
    const raw = val.replace(/,/g, "").replace(/\D/g, "");
    setDisplay(raw ? Number(raw).toLocaleString("vi-VN") : "");
    if (onChange) onChange(Number(raw));
  };

  return (
    <>
      <input
        name={name}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={(e) => handleChange(e.target.value)}
        className={className}
        placeholder={placeholder ?? "VD: 50,000"}
        required={required}
        autoComplete="off"
      />
      <input name={`${name}_raw`} type="hidden" value={display.replace(/,/g, "")} />
    </>
  );
}
