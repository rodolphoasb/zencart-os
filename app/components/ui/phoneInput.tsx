import * as React from "react";
import type {CountryCode  } from "libphonenumber-js";
import {AsYouType} from "libphonenumber-js";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "~/utils";
import { listOfCountries } from "../utils/list-of-countries";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

function CountryInput({
  countryValue,
  setCountryValue,
}: {
  countryValue: string;
  setCountryValue: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover modal={true} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-expanded={open}
          className="flex w-auto items-center justify-between bg-gray-100 p-2"
        >
          {countryValue
            ? listOfCountries.find(
                (country) => country.name.toLowerCase() === countryValue,
              )?.flag
            : "Select"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto max-w-[380px] p-0">
        <Command>
          <CommandInput
            className="my-1 border-0"
            placeholder="Search country..."
          />
          <CommandEmpty>No country found.</CommandEmpty>
          <CommandGroup className="max-h-[10rem] overflow-y-auto">
            {listOfCountries.map((country) => (
              <CommandItem
                key={country.name}
                value={country.name}
                onSelect={(currentValue) => {
                  setCountryValue(
                    currentValue === countryValue ? "" : currentValue,
                  );
                  setOpen(false);
                }}
                className="flex items-center"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    countryValue === country.name ? "opacity-100" : "opacity-0",
                  )}
                />
                {country.flag} {country.name} ({country.dial_code})
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const PhoneInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const [countryValue, setCountryValue] = React.useState("brazil");
    const [phoneNumber, setPhoneNumber] = React.useState("");
    const countryDialCode = listOfCountries.find(
      (country) => country.name.toLowerCase() === countryValue,
    )?.dial_code;

    const country = listOfCountries.find(
      (country) => country.name.toLowerCase() === countryValue,
    )?.code as CountryCode;

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      // https://github.com/catamphetamine/libphonenumber-js/issues/225
      if (event.target.value.length <= 4) {
        setPhoneNumber(event.target.value);
        return;
      }

      // Format number as user types
      const formattedNumber = new AsYouType(country).input(event.target.value);
      setPhoneNumber(formattedNumber);
    };

    return (
      <label className="flex h-10 w-full rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
        <CountryInput
          countryValue={countryValue}
          setCountryValue={setCountryValue}
        />
        <input
          className={cn("w-full rounded-r-md border-0", className)}
          value={phoneNumber}
          onChange={handleInputChange}
        />
        <input
          ref={ref}
          type="hidden"
          value={`${countryDialCode} ${phoneNumber}`}
          {...props}
        />
      </label>
    );
  },
);
PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
