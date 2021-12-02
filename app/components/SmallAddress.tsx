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
  if (!value) {
    return <></>;
  }

  const address = 
    value.slice(0, headCount) +
    separator +
    value.slice(value.length - tailCount, value.length);

  return (
    <>{address}</>
  );
}