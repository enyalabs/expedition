import { Table, TableBody, TableCell, TableHead, TableRow, Typography, LinearProgress, Tooltip } from "@material-ui/core";
import * as React from "react";
import Link from "@material-ui/core/Link";
import { hexToDate, hexToNumber } from "@etclabscore/eserialize";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import moment from 'moment';

const rightPaddingFix = {
  paddingRight: "24px",
};

function BlockList({ blocks }: any) {
  const { t } = useTranslation();
  
  if (!blocks) {
    return null;
  }

  let sortedBlocks = [];
  try {
    sortedBlocks = blocks.sort((a: { number: number }, b: { number: number }) => {
      return b.number - a.number;
    });
  } catch {
    sortedBlocks = blocks;
  }

  return (
    <div style={{ width: "100%", overflowX: "auto", marginBottom: "20px" }}>
      <Table>
        <TableHead>
          <TableRow>
            {/* <TableCell><Typography>{t("Author")}</Typography></TableCell> */}
            <TableCell><Typography>{t("Hash")}</Typography></TableCell>
            <TableCell><Typography>{t("Block Number")}</Typography></TableCell>
            <TableCell><Typography>{t("Timestamp")}</Typography></TableCell>
            <TableCell><Typography>{t("#Txs")}</Typography></TableCell>
            <TableCell><Typography>{t("Gas Usage")}</Typography></TableCell>
            <TableCell><Typography>{t("Gas Limit")}</Typography></TableCell>
            {/* <TableCell><Typography>{t("Uncles")}</Typography></TableCell> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedBlocks.map((b: any, index: number) => {
            const filledPercent = (hexToNumber(b.gasUsed) / hexToNumber(b.gasLimit)) * 100;

            // const authorHashShort = b.miner.substring(2, 6) + "—" +
            //   b.miner.substring(b.miner.length - 5, b.miner.length - 1);

            // Colorize left border derived from author credit account.
            const authorHashStyle = {
              borderLeft: `1em solid #${b.hash.substring(2, 8)}40`,
            };

            // Tally transactions which create contracts vs transactions with addresses.
            const txTypes = {
              create: 0,
              transact: 0,
            };

            b.transactions.forEach((tx: any) => {
              if (tx.to !== null) {
                txTypes.transact++;
              } else {
                txTypes.create++;
              }
            });

            const timestamp = moment(hexToDate(b.timestamp));
            const now = moment();
            let timeAgo, time;
            timeAgo = now.diff(timestamp, 'seconds');
            time = `${timeAgo} seconds ago`;
            if (timeAgo > 60) {
              timeAgo = now.diff(timestamp, 'minutes');
              time = `${timeAgo} mins ago`;
            }
            if (timeAgo > 60) {
              timeAgo = now.diff(timestamp, 'hours');
              const timeAgo2 = now.diff(timestamp, 'minutes') - timeAgo * 60;
              time = `${timeAgo} hrs ${timeAgo2} mins ago`;
            }

            return (
              <TableRow key={b.number} style={authorHashStyle}>
                <TableCell style={rightPaddingFix}>
                  <Link
                    component={({ className, children }: { children: any, className: string }) => (
                      <RouterLink className={className} to={`/block/${b.hash}`} >
                        {children}
                      </RouterLink>
                    )}>
                    {b.hash}
                  </Link>
                </TableCell>
                <TableCell component="th" scope="row">
                  <Link
                    component={({ className, children }: { children: any, className: string }) => (
                      <RouterLink className={className} to={`/block/${b.hash}`} >
                        {children}
                      </RouterLink>
                    )}>
                    {parseInt(b.number, 16)}
                  </Link>
                </TableCell>
                <TableCell style={{...rightPaddingFix, whiteSpace: 'nowrap'}}>
                  <Typography>{time}</Typography>
                </TableCell>
                <TableCell style={rightPaddingFix}>
                  {/* <Tooltip
                    title={t("Create Transactions", {count: txTypes.create}) as string}
                    placement="top"
                  >
                    <Typography variant="caption" color="textSecondary">
                      {txTypes.create === 0 ? "" : txTypes.create}
                    </Typography>
                  </Tooltip> */}
                  <Typography>{txTypes.transact}</Typography>
                </TableCell>
                <TableCell style={rightPaddingFix}>
                  <LinearProgress value={filledPercent} variant="determinate" />
                </TableCell>
                <TableCell>
                  <Typography>{hexToNumber(b.gasLimit)}</Typography>
                </TableCell>
                {/* <TableCell>
                  <Typography>{b.uncles.length === 0 ? "" : b.uncles.length}</Typography>
                </TableCell> */}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>

  );
}

export default BlockList;
