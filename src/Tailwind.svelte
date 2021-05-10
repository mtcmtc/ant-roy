<style global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  @layer base{
    p strong{
      @apply uppercase text-aurora-dark;
    }
  }

  @layer utilities {
  	@variants responsive {
  		.column-count-1 {
  			column-count: 1;
  		}

  		.column-count-2 {
  			column-count: 2;
  		}

  		.column-count-3 {
  			column-count: 3;
  		}

  		.column-count-4 {
  			column-count: 4;
  		}

  		.column-gap-0{
  			column-gap: 0;
  		}

  		.column-gap-1{
  			column-gap: 1;
  		}

  		.column-gap-2{
  			column-gap: 2;
  		}

  		.break-inside-avoid{
  			break-inside: avoid;
  		}
  	}
  }

  .ytVideo iframe{
    width:100% !important;
  }
  iframe[id*="twitter-widget"]{
  	width:100% !important;
  }
</style>