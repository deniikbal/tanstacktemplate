import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"

interface TableSkeletonProps {
  columnCount: number
  rowCount?: number
  showCheckbox?: boolean
  showActions?: boolean
}

export function TableSkeleton({ 
  columnCount, 
  rowCount = 5, 
  showCheckbox = false,
  showActions = true 
}: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {showCheckbox && (
            <TableCell className="w-12 text-center">
              <Skeleton className="h-4 w-4 mx-auto rounded" />
            </TableCell>
          )}
          
          {Array.from({ length: columnCount }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton 
                className="h-5 rounded-md opacity-70" 
                style={{ 
                  width: `${60 + (colIndex * 15 + rowIndex * 7) % 35}%` 
                }}
              />
            </TableCell>
          ))}

          {showActions && (
            <TableCell className="text-right pr-6">
              <Skeleton className="h-8 w-8 ml-auto rounded-full opacity-60" />
            </TableCell>
          )}
        </TableRow>
      ))}
    </>
  )
}
