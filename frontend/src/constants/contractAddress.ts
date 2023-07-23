import { Address } from "viem";

export const CONTRACT_ADDRESS: Record<
  number,
  Record<string, Address | undefined>
> = {
  80001: {
    registry: "0x02101dfB77FDE026414827Fdc604ddAF224F0921",
    entryPoint: "0xb9491f0aB924a1D9D565a4105123919F010a760a",
    accountGuardian: "0xA578341F43F6CFcb5D871e827cebaB9bc7dAb150",
    accountSponsorable: "0x96Ed87a30FD527B6D9DA3e1f58912811A9DCa484",
    accountProxy: "0x3D6ba063Ff79609E7B68455a1b09435984C0003e",
  },
  5: {
    registry: "0x02101dfB77FDE026414827Fdc604ddAF224F0921",
    entryPoint: "0x30B7cd380a582fBff8e00a90b9EcAbeA6D47eE28",
    accountGuardian: "0xa7EB4F8E6ce4A166187634968dF2De362d8b2f22",
    accountSponsorable: "0xe9cbe08cF539BeB87e6bbC93604A9990F68FFD9E",
    accountProxy: "0x93a7671C1074E17354612c6324D167b6b3e96983",
    svgLayerTransformer: "0xeeBC73bE721b3DdeBEAff608654263d382DF3003",
    tokenCollection: "0xFA1F0dF0db6CbAbC1DEbA9b579c9ca1cB14b6595",
    apeTokenCollection: "0x496AEbf46C832A371E63eDAc098b64a97AA6cf5c",
    stringInjectTransformer: "0x81610B0d990F56fF8Cc46FeeB3e61210CFC33F57",
  },
  1101: {
    registry: undefined,
    entryPoint: undefined,
    accountGuardian: undefined,
    accountSponsorable: undefined,
    accountProxy: undefined,
  },
  137: {
    registry: "0x02101dfB77FDE026414827Fdc604ddAF224F0921",
    entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    accountGuardian: "0x2D4d71C69b5631b557a4de7bD8aF82e2202da856",
    accountSponsorable: "0x5cc93ea88E3A114D586263E8B42e2c49d3943092",
    accountProxy: "0xee74464671085A16D7B780A21f285cEb306d434c",
    svgLayerTransformer: "0xbEB637D81e11dCc81012bb2AAc79f2b2A2CC7A09",
    tokenCollection: "0xcb25E9dcF86dB259765bA7a986dF142B41414036",
  },
  1: {
    registry: "0x02101dfB77FDE026414827Fdc604ddAF224F0921",
    entryPoint: undefined,
    accountGuardian: undefined,
    accountSponsorable: undefined,
    accountProxy: undefined,
  },
  1442: {
    registry: undefined,
    entryPoint: undefined,
    accountGuardian: undefined,
    accountSponsorable: undefined,
    accountProxy: undefined,
  },
} as const;
