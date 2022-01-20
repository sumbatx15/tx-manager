import { Flex, Text } from "@chakra-ui/react";
import { store } from "../store";
import { FeatherGasStation } from "../assets/FeatherGasStation";
import { observer } from "mobx-react-lite";
import { FC } from "react";
import { useMoralis } from 'react-moralis'

interface Props {
  gasFee: string;
  externalGasFee: string
}
export const EstimatedGas: FC<Props> = observer(({ gasFee, externalGasFee }) => {
  const usdPrice = store.tokens.prices.map['0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee']?.usdPrice || store.tokens.prices.map['0x0000000000000000000000000000000000000000']?.usdPrice

  const { web3 } = useMoralis();
  return (
    <Flex
      hidden={+gasFee > +externalGasFee}
      alignItems="center"
      justifyContent="center"
      fontSize="sm"
      color="gray.400"
      gap={1}
    >
      <FeatherGasStation stroke="none" fill="var(--chakra-colors-primary-200)" />
      <Text>Gas: </Text>
      <Text color="primary.200">
        {usdPrice
          ? `$${(Number(web3?.utils.fromWei(gasFee, 'ether')) * usdPrice).toFixed(2)}`
          : `${Number(Number(web3?.utils.fromWei(gasFee, 'ether')).toFixed(5))} ${store.tokens.native.symbol}`
        }
      </Text>
      <Text>instead of</Text>
      <Text decoration="line-through" color="yellow.800">
        {usdPrice
          ? `$${(Number(web3?.utils.fromWei(externalGasFee, 'ether')) * usdPrice).toFixed(2)}`
          : `${Number(Number(web3?.utils.fromWei(externalGasFee, 'ether')).toFixed(5))} ${store.tokens.native.symbol}`
        }
      </Text>
    </Flex>
  )
});
