import { Table, TableBody, TableCell, TableHead, TableRow, Typography, LinearProgress, Tooltip } from "@material-ui/core";
import * as React from "react";
import Link from "@material-ui/core/Link";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import moment from 'moment';

const rightPaddingFix = {
  paddingRight: "24px",
};

function TransactionList({ txs }: any) {
  const { t } = useTranslation();
  if (!txs) {
    return null;
  }
  const sortedTXs = txs.sort((a: { number: number }, b: { number: number }) => {
    return b.number - a.number;
  });
  return (
    <div style={{ width: "100%", overflowX: "auto", marginBottom: "20px" }}>
      <Table>
        <TableHead>
          <TableRow>
            {/* <TableCell><Typography>{t("Author")}</Typography></TableCell> */}
            <TableCell><Typography>{t("Transactions")}</Typography></TableCell>
            <TableCell><Typography>{t("Block Number")}</Typography></TableCell>
            <TableCell><Typography>{t("From")}</Typography></TableCell>
            <TableCell><Typography>{t("To")}</Typography></TableCell>
            <TableCell><Typography>{t("Timestamp")}</Typography></TableCell>
            <TableCell><Typography>{t("Gas Usage")}</Typography></TableCell>
            {/* <TableCell><Typography>{t("Uncles")}</Typography></TableCell> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedTXs.map((b: any, index: number) => {

            // const authorHashShort = b.miner.substring(2, 6) + "—" +
            //   b.miner.substring(b.miner.length - 5, b.miner.length - 1);

            // Colorize left border derived from author credit account.
            const authorHashStyle = {
              borderLeft: `1em solid #${b.hash.substring(2, 8)}40`,
            };

            const timestamp = moment.unix(b.timeStamp);
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
                      <RouterLink className={className} to={`/tx/${b.hash}`} >
                        {children}
                      </RouterLink>
                    )}>
                    {b.hash ? b.hash.slice(0, 45) + '...' : ''}
                  </Link>
                </TableCell>
                <TableCell component="th" scope="row">
                  <Link
                    component={({ className, children }: { children: any, className: string }) => (
                      <RouterLink className={className} to={`/block/${b.blockNumber}`} >
                        {children}
                      </RouterLink>
                    )}>
                    {parseInt(b.blockNumber, 16)}
                  </Link>
                </TableCell>
                <TableCell component="th" scope="row">
                  <Link
                    component={({ className, children }: { children: any, className: string }) => (
                      <RouterLink className={className} to={`/address/${b.from}`} >
                        {children}
                      </RouterLink>
                    )}>
                    {b.from ? b.from.slice(0, 25) + '...' : ''}
                  </Link>
                </TableCell>
                <TableCell component="th" scope="row">
                  <Link
                    component={({ className, children }: { children: any, className: string }) => (
                      <RouterLink className={className} to={`/address/${b.to}`} >
                        {children}
                      </RouterLink>
                    )}>
                    {b.to ? b.to.slice(0, 25) + '...' : ''}
                  </Link>
                </TableCell>
                <TableCell style={{...rightPaddingFix, whiteSpace: 'nowrap'}}>
                  {/* <Typography>{t("Timestamp Date", { date: hexToDate(ethers.utils.hexlify(b.timeStamp))})} */}
                  <Typography>{time}</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{Number(b.gasUsed)}</Typography>
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

export default TransactionList;
