import { RotatingCredential } from "./rotating-credential";

describe("rotating-credential", () => {
  it("should sign and verify string using provided keys", async () => {
    const credential = new RotatingCredential(["key1", "key2"]);
    const key = await credential.sign("some string");

    expect(key).toEqual("o7JXe_dO9VlA7ofGeu_IeV9iFK74t6SNdLt5XIADMeVFrJxEHpVMuD5HSU6kS9iCdApPxowqWGYZmRIUcjxLTg");
    expect(await credential.verify("some string", key)).toBe(true);
    expect(await credential.verify("some string", "wat")).toBe(false);
    expect(await credential.verify("some", key)).toBe(false);
  });

  it("should sign and verify string using different set keys where at least one matches", async () => {
    const credential1 = new RotatingCredential(["key1", "key2"]);
    const credential2 = new RotatingCredential(["key2"]);
    const key = await credential2.sign("some string");

    expect(await credential1.verify("some string", key)).toBe(true);
  });
});
