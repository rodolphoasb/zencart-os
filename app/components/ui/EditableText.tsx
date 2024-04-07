import React, { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useFetcher } from "@remix-run/react";

type EditableTextProps = {
  children?: React.ReactNode;
  fieldName: string;
  value: string;
  buttonLabel?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rowType: any;
  // rowType: AttributeType;
  rowIndex: number;
  columnId: string;
  customerId: number;
  attributeId: number;
  updateMetaData: ({
    index,
    id,
    value,
  }: {
    index: number;
    id: string;
    value: string;
  }) => void;
};

export function EditableText({
  children,
  fieldName,
  value,
  buttonLabel,
  updateMetaData,
  rowType,
  rowIndex,
  attributeId,
  customerId,
  columnId,
}: EditableTextProps) {
  const fetcher = useFetcher({ key: `update-attribute-value` });
  const [edit, setEdit] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  if (
    fetcher.formData?.has("value") &&
    fetcher.formData.get("fieldName") === fieldName
  ) {
    value = String(fetcher.formData.get("value"));
  }

  return edit ? (
    <fetcher.Form
      method="post"
      onSubmit={(event) => {
        event.preventDefault();

        if (inputRef.current?.value !== value) {
          const data = {
            fieldName: fieldName,
            value: inputRef.current?.value || "",
            attributeId: String(attributeId),
            customerId: String(customerId),
            rowType: String(rowType),
          };

          fetcher.submit(data, {
            method: "POST",
          });

          updateMetaData({
            index: rowIndex,
            id: columnId,
            value: inputRef.current?.value || "",
          });
        }

        flushSync(() => {
          setEdit(false);
        });
        // we're done updating the DOM
        buttonRef.current?.focus();
      }}
    >
      {children}
      <input
        ref={inputRef}
        type="text"
        aria-label={fieldName}
        name={fieldName}
        defaultValue={value}
        className="h-[28px] w-auto border-0 bg-gray-100 p-0 text-gray-900 focus:border-b focus:border-gray-300 focus:ring-0 sm:text-sm sm:leading-6"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            flushSync(() => {
              setEdit(false);
            });
            buttonRef.current?.focus();
          }
        }}
        onBlur={() => {
          if (inputRef.current?.value !== value) {
            const data = {
              fieldName: fieldName,
              value: inputRef.current?.value || "",
              attributeId: String(attributeId),
              customerId: String(customerId),
              rowType: String(rowType),
            };

            fetcher.submit(data, {
              method: "POST",
            });

            updateMetaData({
              index: rowIndex,
              id: columnId,
              value: inputRef.current?.value || "",
            });
          }
          setEdit(false);
        }}
      />
    </fetcher.Form>
  ) : (
    <button
      ref={buttonRef}
      aria-label={buttonLabel}
      type="button"
      onClick={() => {
        flushSync(() => {
          setEdit(true);
        });
        inputRef.current?.select();
      }}
      className="h-[28px] w-auto border-0 text-gray-500 hover:text-gray-700"
    >
      {value || <span>Editar</span>}
    </button>
  );
}
