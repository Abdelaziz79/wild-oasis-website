import { getCabins } from "../_lib/data-service";

export const revalidate = 86400;

export default async function CabinNumber() {
  const cabins = await getCabins();
  return <span className="text-yellow-200 text-xl"> {cabins.length} </span>;
}
