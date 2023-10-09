import { Token } from '@uniswap/sdk-core'

export class TokenWithLogo extends Token {
  customWrapped?: TokenWithLogo

  constructor(
    public logoURI: string | undefined, // <--- this is the only difference
    chainId: number,
    address: string,
    decimals: number,
    symbol?: string,
    name?: string,
    bypassChecksum?: boolean
  ) {
    super(chainId, address, decimals, symbol, name, bypassChecksum)
  }

  get wrapped(): TokenWithLogo {
    return this.customWrapped || (super.wrapped as TokenWithLogo)
  }
}
