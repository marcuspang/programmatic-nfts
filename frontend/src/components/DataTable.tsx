import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAccountSponsorableApproveSponsorship,
  useAccountSponsorableDisapproveSponsorship,
  usePrepareAccountSponsorableApproveSponsorship,
  usePrepareAccountSponsorableDisapproveSponsorship,
} from "@/lib/generated";
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import * as React from "react";
import { Address, formatEther } from "viem";
import { useAccount, useNetwork } from "wagmi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useToast } from "./ui/use-toast";

export interface Sponsorship {
  id: number;
  readonly endBlock: bigint;
  readonly startBlock: bigint;
  readonly isActive: boolean;
  readonly isApproved: boolean;
  readonly sponsor: Address;
  readonly transformerAddress: Address;
  readonly fee: bigint;
}
const generateColumns = (tbaAddress: Address) =>
  [
    {
      accessorKey: "sponsor",
      header: "Sponsor",
      cell: ({ row }) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="cursor-default">
              {row.getValue("sponsor").slice(0, 6) + "..."}
            </TooltipTrigger>
            <TooltipContent>{row.getValue("sponsor")}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      accessorKey: "fee",
      header: () => <div>Fee (in ETH)</div>,
      cell: ({ row }) => {
        const amount = row.getValue("fee");

        return <div className="font-medium">{formatEther(amount)}</div>;
      },
    },
    {
      accessorKey: "startBlock",
      header: "Start Block",
      cell: ({ row }) => (
        <div className="capitalize">{Number(row.getValue("startBlock"))}</div>
      ),
    },
    {
      accessorKey: "endBlock",
      header: "End Block",
      cell: ({ row }) => (
        <div className="capitalize">{Number(row.getValue("endBlock"))}</div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Is Active?",
      cell: ({ row }) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Checkbox checked={row.getValue("isActive")} disabled />
            </TooltipTrigger>
            <TooltipContent>Modified by sponsors</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      accessorKey: "isApproved",
      header: "Is Approved?",
      cell: ({ row }) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <CheckboxForIsActive row={row} tbaAddress={tbaAddress} />
            </TooltipTrigger>
            <TooltipContent>
              Enable sponsorship and receive fees!
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
  ] as ColumnDef<Sponsorship>[];

function CheckboxForIsActive({
  row,
  tbaAddress,
}: {
  row: Row<Sponsorship>;
  tbaAddress: Address;
}) {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { config } = usePrepareAccountSponsorableApproveSponsorship({
    account: address as Address,
    address: tbaAddress,
    chainId: chain?.id,
    args: [BigInt(row.id || 0)],
    enabled: chain !== undefined && !row.original.isApproved,
  });
  const { data, isLoading, isSuccess, write } =
    useAccountSponsorableApproveSponsorship(config);
  const { config: disapproveConfig } =
    usePrepareAccountSponsorableDisapproveSponsorship({
      account: address as Address,
      address: tbaAddress,
      chainId: chain?.id,
      args: [BigInt(row.id || 0)],
      enabled: chain !== undefined && !row.original.isApproved,
    });
  const {
    data: disapproveData,
    isLoading: disapproveIsLoading,
    isSuccess: disapproveIsSuccess,
    write: disapproveWrite,
  } = useAccountSponsorableDisapproveSponsorship(disapproveConfig);

  const { toast } = useToast();

  React.useEffect(() => {
    if (chain) {
      if (isSuccess) {
        toast({
          title: "Successfully approved sponsorship",
          description:
            "If the start block is near the current one, the transformation should happen automatically!",
        });
      } else if (isLoading) {
        toast({
          title: "Approving sponsorship...",
          description: "Transaction hash: " + data?.hash,
        });
      }
    }
  }, [data?.hash, isLoading]);

  React.useEffect(() => {
    if (chain) {
      if (disapproveIsSuccess) {
        toast({
          title: "Successfully disapproved sponsorship",
          description:
            "The transformer changes should have reverted automatically!",
        });
      } else if (disapproveIsLoading) {
        toast({
          title: "Disapproving sponsorship...",
          description: "Transaction hash: " + data?.hash,
        });
      }
    }
  }, [disapproveData?.hash, disapproveIsLoading]);

  return (
    <Checkbox
      onClick={() => {
        if (!row.getValue("isApproved")) {
          write?.();
        } else {
          disapprove?.write();
        }
      }}
      checked={row.getValue("isApproved")}
    />
  );
}

export function DataTable({
  data,
  tbaAddress,
}: {
  data: Sponsorship[];
  tbaAddress: Address;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const columns = React.useMemo(
    () => generateColumns(tbaAddress),
    [tbaAddress]
  );

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter sponsors..."
          value={(table.getColumn("sponsor")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("sponsor")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
