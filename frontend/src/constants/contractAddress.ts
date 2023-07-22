import { Address } from "viem";

export const CONTRACT_ADDRESS: Record<number, Record<string, Address>> = {
  80001: {
    registry: "0x02101dfB77FDE026414827Fdc604ddAF224F0921",
    entryPoint: "0xb9491f0aB924a1D9D565a4105123919F010a760a",
    accountGuardian: "0xA578341F43F6CFcb5D871e827cebaB9bc7dAb150",
    accountSponsorable: "0x96Ed87a30FD527B6D9DA3e1f58912811A9DCa484",
    accountProxy: "0x3D6ba063Ff79609E7B68455a1b09435984C0003e",
  },
  5: {
    registry: "0x02101dfB77FDE026414827Fdc604ddAF224F0921",
    entryPoint: "0x",
    accountGuardian: "0x",
    accountSponsorable: "0x",
    accountProxy: "0x",
  },
  1101: {
    registry: "0x",
    entryPoint: "0x",
    accountGuardian: "0x",
    accountSponsorable: "0x",
    accountProxy: "0x",
  },
  137: {
    registry: "0x02101dfB77FDE026414827Fdc604ddAF224F0921",
    entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    accountGuardian: "0x2D4d71C69b5631b557a4de7bD8aF82e2202da856",
    accountSponsorable: "0x5cc93ea88E3A114D586263E8B42e2c49d3943092",
    accountProxy: "0xee74464671085A16D7B780A21f285cEb306d434c",
  },
  1: {
    registry: "0x02101dfB77FDE026414827Fdc604ddAF224F0921",
    entryPoint: "0x",
    accountGuardian: "0x",
    accountSponsorable: "0x",
    accountProxy: "0x",
  },
  1442: {
    registry: "0x",
    entryPoint: "0x",
    accountGuardian: "0x",
    accountSponsorable: "0x",
    accountProxy: "0x",
  },
} as const;
