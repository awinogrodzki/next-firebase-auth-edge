import { base64StringToObject } from "./utils"

describe('jwt utils', () => {
  it('should parse base 64 string to object', () => {
    expect(
      base64StringToObject('eyJpbmNvcnJlY3RWYWx1ZSI6Ij8_Pz8_Pz8_Pz8ifQ')
    ).toEqual({
      "incorrectValue": "??????????"
    })
  })
});
