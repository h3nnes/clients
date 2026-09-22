import { FormControl, FormGroup } from "@angular/forms";

import { customRequestHeaderFormValidator } from "./self-hosted-env-config-dialog.component";

describe("customRequestHeaderFormValidator", () => {
  function validate(name: string, value: string) {
    const group = new FormGroup({
      customHeaderName: new FormControl(name),
      customHeaderValue: new FormControl(value),
    });
    return customRequestHeaderFormValidator()(group);
  }

  it("allows both fields to be empty", () => {
    expect(validate("", "")).toBeNull();
  });

  it("allows a valid name/value pair", () => {
    expect(validate("X-Auth", "secret")).toBeNull();
  });

  it("rejects an invalid name with a name reason", () => {
    expect(validate("Bad Name", "secret")).toEqual({
      customRequestHeaderInvalid: { reason: "name" },
    });
  });

  it("rejects a control-character value with a value reason", () => {
    expect(validate("X-Auth", "a\r\nb")).toEqual({
      customRequestHeaderInvalid: { reason: "value" },
    });
  });

  it("rejects a half-configured pair", () => {
    expect(validate("X-Auth", "")).not.toBeNull();
    expect(validate("", "secret")).not.toBeNull();
  });
});
