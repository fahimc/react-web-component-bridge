import { expectTypeOf } from "expect-type";
import type { ReactElementOptions } from "@fahimc/react-web-component-bridge";

type Props = {
  selectedId?: string;
  loading?: boolean;
  onSelect?: (id: string, index: number) => void;
};

const options = {
  props: {
    selectedId: { attribute: "selected-id", type: "string", reflect: true },
    loading: { type: "boolean", reflect: true }
  },
  events: {
    onSelect: {
      name: "select",
      detail: (id: string, index: number) => ({ id, index })
    }
  }
} satisfies ReactElementOptions<Props>;

expectTypeOf(options.props.selectedId.type).toEqualTypeOf<"string">();
