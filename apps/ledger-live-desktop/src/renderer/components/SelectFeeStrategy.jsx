// @flow
import React from "react";
import styled from "styled-components";
import { useTranslation, Trans } from "react-i18next";
import type { BigNumber } from "bignumber.js";

import Box, { Tabbable }  from "~/renderer/components/Box";
import Text from "~/renderer/components/Text";
import TachometerHigh from "~/renderer/icons/TachometerHigh";
import TachometerLow from "~/renderer/icons/TachometerLow";
import TachometerMedium from "~/renderer/icons/TachometerMedium";
import Clock from "~/renderer/icons/Clock";

import FormattedVal from "~/renderer/components/FormattedVal";
import CounterValue from "~/renderer/components/CounterValue";

import {
  getAccountCurrency,
  getAccountUnit,
  getMainAccount,
} from "@ledgerhq/live-common/account/index";
import type { Account, FeeStrategy } from "@ledgerhq/live-common/types/index";

type OnClickType = {
  amount: BigNumber,
  feesStrategy: string,
};

type Props = {
  onClick: OnClickType => void,
  transaction: *,
  account: Account,
  parentAccount: ?Account,
  strategies: FeeStrategy[],
  mapStrategies?: FeeStrategy => FeeStrategy & { [string]: * },
  suffixPerByte?: boolean,
};

const FeesWrapper = styled(Tabbable)`
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 6px;

  border: ${p =>
    `1px solid ${
      p.selected ? p.theme.colors.palette.primary.main : p.theme.colors.palette.divider
    }`};
  padding: 20px 16px;
  font-family: "Inter";
  border-radius: 4px;
  width: 140px;
  ${p => (p.disabled ? `background: ${p.theme.colors.palette.background.default};` : "")};

  &:hover {
    cursor: ${p => (p.disabled ? "unset" : "pointer")};
  }
`;

const FeesHeader = styled(Box)`
  color: ${p =>
    p.selected
      ? p.theme.colors.palette.primary.main
      : p.disabled
      ? p.theme.colors.palette.text.shade20
      : p.theme.colors.palette.text.shade50};
`;

const FeesValue = styled(Box)`
  flex-direction: column;
  align-items: center;
`;

const ApproximateTransactionTime = styled(Box)`
  flex-direction: row;
  align-items: center;
  border-radius: 3px;
  background-color: ${p =>
    p.selected
      ? p.theme.colors.palette.primary.main
      : p.theme.colors.palette.text.shade20};
  padding: 5px 6px;
`;

const SelectFeeStrategy = ({
  transaction,
  account,
  parentAccount,
  onClick,
  strategies,
  mapStrategies,
  suffixPerByte,
}: Props) => {
  const mainAccount = getMainAccount(account, parentAccount);
  const accountUnit = getAccountUnit(mainAccount);
  const feesCurrency = getAccountCurrency(mainAccount);
  const { t } = useTranslation();
  strategies = mapStrategies ? strategies.map(mapStrategies) : strategies;

  return (
    <Box horizontal justifyContent="center" flexWrap="wrap" gap="16px">
      {strategies.map(s => {
        const selected = transaction.feesStrategy === s.label;
        const amount = s.displayedAmount || s.amount;
        const { label, disabled } = s;
        return (
          <FeesWrapper
            key={s.label}
            selected={selected}
            disabled={disabled}
            onClick={() => {
              !disabled && onClick({ amount: s.amount, feesStrategy: label, txParameters: s.txParameters });
            }}
          >
            <FeesHeader horizontal alignItems="center" selected={selected} disabled={disabled}>
              {label === "medium" ? (
                <TachometerMedium size={13} />
              ) : label === "slow" ? (
                <TachometerLow size={13} />
              ) : (
                <TachometerHigh size={13} />
              )}
              <Text fontSize={0} ff="Inter|ExtraBold" uppercase ml={1} letterSpacing="0.1em">
                <Trans i18nKey={`fees.${label}`} />
              </Text>
            </FeesHeader>
            <FeesValue>
              <FormattedVal
                noShrink
                inline
                color={
                  selected
                    ? "palette.primary.main"
                    : disabled
                    ? "palette.text.shade40"
                    : "palette.text.shade100"
                }
                fontSize={3}
                fontWeight="600"
                val={amount}
                unit={s.unit ?? accountUnit}
                showCode={!suffixPerByte}
                suffix={
                  suffixPerByte
                    ? ` ${t("send.steps.details.unitPerByte", {
                        unit: s.unit ? s.unit.code : accountUnit.code,
                      })}`
                    : ""
                }
                alwaysShowValue
              />
              {s.displayedAmount ? (
                <CounterValue
                  inline
                  currency={feesCurrency}
                  value={amount}
                  color={disabled ? "palette.text.shade20" : "palette.text.shade50"}
                  fontSize={3}
                  showCode
                  alwaysShowValue
                />
              ) : null}
            </FeesValue>
            {feesCurrency.id === 'ethereum' &&
            <ApproximateTransactionTime selected={selected}>
              <Clock size={12} />
              <Text fontSize={2} fontWeight="500" ml={1}>
                {label === "medium" ? (
                  <>≈ 30 <Trans i18nKey={"time.second_short"} /></>
                ) : label === "slow" ? (
                  <>≈ 2-3 <Trans i18nKey={"time.minute_short"} /></>
                ) : (
                  <>≈ 15 <Trans i18nKey={"time.second_short"} /></>
                )}
              </Text>
            </ApproximateTransactionTime>}
          </FeesWrapper>
        );
      })}
    </Box>
  );
};

export default SelectFeeStrategy;
