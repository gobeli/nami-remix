import { useState } from "react";

type SmallAddressProps = {
  value: string;
  headCount?: number;
  tailCount?: number;
  separator?: string;
};

export default function SmallAddress({
  value,
  headCount = 5,
  tailCount = 5,
  separator = "..." 
}: SmallAddressProps) {
  const [open, setOpen] = useState(false);

  if (!value) {
    return <></>;
  }

  const address = open ? value : (
    value.slice(0, headCount) +
    separator +
    value.slice(value.length - tailCount, value.length)
  );

  return (
    <button onClick={() => setOpen(!open)} className="text-button">{address}</button>
  );
}