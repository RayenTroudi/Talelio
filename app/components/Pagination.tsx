
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination";
import { usePathname, useSearchParams} from 'next/navigation';






const PaginationSection = (
{totalItems ,
itemperpage ,
CurrentPage ,
setCurrentPage,
}:
{
totalItems : any
itemperpage :any 
CurrentPage :any 
setCurrentPage :any
}) => {

  

    let pages = []
    for (let i=1; i <= Math.ceil(totalItems/itemperpage); i++ )
    pages.push(i)

    const HandlePrev = () => {
        if(CurrentPage > 1)(
            setCurrentPage(CurrentPage - 1)
        )
    }
       const HandleNext = () => {
        if(CurrentPage < (pages.length))(
            setCurrentPage(CurrentPage + 1)
        )
    }

    const searchParams = useSearchParams()
    const pathname = usePathname()
   


    const CreatePageURL = (pageNumber:number | string) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', pageNumber.toString())
        return `${pathname}?${params.toString()}`
    }
  return (
    <div className="mt-20">
       <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href={`#page=${CurrentPage}`}
            onClick={() => HandlePrev()}
           
           />
          </PaginationItem>

          {pages.map((page, id) => 
          <PaginationItem key={id}
          className={CurrentPage === page ? "bg-neutral-100 rounded-md": ""}>
            <PaginationLink onClick={() => setCurrentPage(page)} href={`#page=${page}`}>{page}</PaginationLink>
          </PaginationItem>
          )}
       
          <PaginationItem>
            <PaginationNext href={`#page=${CurrentPage}`}
             onClick={() => HandleNext()}
          />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export default PaginationSection
