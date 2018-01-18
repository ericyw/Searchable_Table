(function($) {
    
    $.fn.advancedtable = function(custom) {
    	
        // default configuration        
        var defaults = {
            rowsPerPage: 10,
            currentPage: 1,
            loadElement: "",
            searchColumn: 0,
            searchCaseSensitive: false,
            navigationLabel: "",
            delay: 300,
            sortDefault: "asc",
            sortColumnDefault: 0,
            sorting: true,
            ascImage: "",
            descImage: "",
            csv: "",
            csvSeperator: ",",
            evenColor: "",
            oddColor: ""
        };
        
	// combine user nad default configuration
        var settings = $.extend({}, defaults, custom );	
	
	// decrement currentPage setting
        settings.currentPage--;
        
	// variable declarations
        var table = this;
        var currentPage = 0;
        
	// if csv file table
        if ( settings.csv !== "" ) {		
		
            // show loader box
            showLoad();

            $.get( settings.csv, function( data ) { 
                
                var rows = data.split( "\n" );
                var rowNumber = rows.length;
                var colNumber = rows[0].split( settings.csvSeperator ).length;
                var htmlData = "";
                
                for ( var i = 0; i < rowNumber; i++ ) { 
                    
                    cols = rows[i].split( settings.csvSeperator );
                    
                    htmlData += "<tr class'' style='display: table-row;'>";
                    
                    for ( var j = 0; j < colNumber; j++ ) {
                        
                        htmlData += "<td>" + cols[j] + "</td>";
                    }
                    htmlData += "</tr>";
                }
		
		// fill table
                table.find( "tbody" ).html( htmlData );
                
                // redraw table
                redrawTable();
		
            });
	}
			
	// define searchField if needed
      
	if ( settings.searchField !== "" ) {
            
            $( settings.searchField ).show();
            $( settings.searchField ).keyup(redrawTable);
	}
			
        redrawTable();
        
    
        function redrawTable() {
        
            // show loader box
            showLoad();

            // case-sensitive option string format
            var strSearch = "";
            
            if ( typeof ( this.value ) !== "undefined" ) {
                
                if ( settings.searchCaseSensitive ) {
                    
                    strSearch = this.value;
                
                } else {
                    
                    strSearch = this.value.toLowerCase();
                }
            }
            
            // define counter
            var i = 0;
            
            // start tr loop
            table.find( "tbody tr" ).each( function() {
                
                // set found to false
                var found = false;
                
                // define counter
                var i = 1;

                // start td loop
                $( this ).find( "td" ).each( function() {
                    
                    // if search all columns or search in this column
                    if ( ( settings.searchColumn === 0 ) || ( settings.searchColumn === i ) ) {

                        // case sensitive string format
                        if ( settings.searchCaseSensitive ) {
                            
                            var strCell = stripHTML( this.innerHTML );
                        
                        } else {
                            
                            var strCell = stripHTML( this.innerHTML.toLowerCase() ); 
                        }

                        // if string is found in this cell
                        if ( ( strCell.indexOf( strSearch ) > -1 ) ) {
                            
                            found = true;
                        } 
                        
                    }

                    // Increment column number
                    i++;
                }); // end td loop 
                                
      	        // mark hide or show row
                if ( found ) {
                    
                    $( this ).removeClass( "searchhide" );
                
                } else {
                    
                    $( this ).addClass( "searchhide" );
                }

            });

            // count table rows that match the search term
            tableRows = table.find( "tbody tr:not(.searchhide)" ).length;
            
            // calculate the number of pages
            var pages = Math.ceil( tableRows / settings.rowsPerPage );
            
            // remove old footer 
            table.find( "tfoot" ).remove();
            
            // calculate values
            var firstRow = table.find( "tr:first" );
            var numCols = firstRow[0].cells.length;
            var endRow = ( ( settings.currentPage + 1 ) * settings.rowsPerPage );
            var startRow = ( endRow - settings.rowsPerPage ) + 1;

            // info block
            var blockInfo = "<div class='table-info'>Showing " + startRow + " - " + endRow + ' of ' + tableRows + "</div>";
            
            // if there are more rows than rowsPerPage than build the navigation
            var blockNavigation = "";
            
            if ( tableRows > settings.rowsPerPage ) {    
                
                blockNavigation += "<div class='table-navigation'>";
                
                if ( settings.navigationLabel !== "" ) {
                    
                    blockNavigation += "<span>" + settings.navigationLabel + "&nbsp;&nbsp;</span>";
                }
                
                if ( true ) {    
                
                    
                    blockNavigation += "<ul>";
                    
                    for ( var i = 0; i < pages; i++ ) {
                        
                        blockNavigation += "<li" + ( ( settings.currentPage == i ) ? " class='active'" : "" ) + 
                                "><a href='javascript:void();'>" + ( i + 1 ) + "</a></li>";
                    }
                    
                    blockNavigation += "</ul>";
                
                } else {
                    
                    blockNavigation += "<select id='#tnavigation'>";
                    
                    for ( var i = 0; i < pages; i++ ) {
                        
                        blockNavigation += "<option value='" + ( i + 1 ) + '" ' +
                                (( settings.currentPage == i ) ? "selected='selected'" : "" ) + ">" +
                                ( i + 1 ) + "</option>";
                    }
                    
                    blockNavigation += "</select>";
                }

                blockNavigation += '</div>';
            }

            // add new footer to table
            table.append( "<tfoot><tr><td colspan='" + numCols + "'>" + blockInfo + blockNavigation + "</td></tr></tfoot>" );
            
            // bind clickhandler on pagenavigations
            table.find( ".table-navigation li" ).bind( "click", function() {
                
                // show loader box
                showLoad();

                // get current page number
                var currentPage = ( parseInt( $( this ).find( "a" ).html() ) ) - 1;

                // set active page
                setActivePage( currentPage );
                
                // hide loader box
                hideLoad();

                stripeRows();
            });

            // bind clickhandler on dropdown pagination
            table.find( ".table-navigation select" ).change( function() {    
                
                // show loader box
                // showLoad();

                // get current page number
                // alert( $( this ).find( "option" ).attr( "value" ) );
                alert( $( "#tnavigation :selected" ).val() );
                
                // var currentPage = ( parseInt( $( this ).find( "option" ).value ) ) - 1;
                // set active page
                
                /* setActivePage( currentPage );
		 * 
                 * // hide loader box
                 * hideLoad();	
                 */
            });

            // add sort handlers
            if ( settings.sorting ) {
                 
                 if ( table.find( "thead th a" ).length === 0 ) {
                     
                    var sortHandle = 0;
                     
                    table.find( "thead th" ).each( function() {
                         
                        $( this ).html( "<a href='javascript:void();' id='sort-handle" +
                            sortHandle + "'>" + $( this ).html() + "</a><span id='sort-asc-handle" + sortHandle +
                            "' class='sort-show-handle'><img src='" + settings.ascImage +
                            "' alt='Arrow up icon'/></span><span id='sort-desc-handle" + sortHandle +
                            "' class='sort-show-handle'><img src='" + settings.descImage + 
                            "' alt='Arrow down icon'/></span><span id='sort-type-handle' class='all-sort-type-handle' style='display:none'></span>" );
                        
                        $( this ).bind( "click", sortTable );
                        
                        sortHandle++;
                    });
                    
                    table.find( ".sort-show-handle" ).hide();
                    sortTable( settings.sortColumnDefault );
                 }
            }
            
  
            function sortTable(column) {

                // show loader box
                showLoad();

                if ( typeof ( column ) === "number" ) {
                    
                    var sortColumn = table.find( 'thead th:eq(' + column + ') a' ).attr( "id" );
              
                } else {
                
                    var sortColumn = $( this ).find( 'a' ).attr( "id" );
                }
                sortColumn = sortColumn.replace( "sort-handle", "" );


                var sortAction = getSortAction( sortColumn );
                var rows = new Array( tableRows );

                // fill arrays
                var counter = 0;
                
                table.find( 'tbody tr' ).each( function() {
                    
                    var sortString = $( this ).find( 'td' ).eq( sortColumn ).html().toLowerCase();
                    rows[counter] = [sortString, '<tr>' + $( this ).html() + '</tr>'];
                    counter++;

                });

                if (sortAction === "asc") {
                    
                    rows.sort( sortAsc );
                
                } else {
                    
                    rows.sort( sortDesc );
                }

                var sortedHTML = "";
                
                for ( var i = 0; i < tableRows; i++ ) {
                    
                    sortedHTML += rows[i][1];
                }

                table.find( 'tbody' ).html( sortedHTML );

                redrawTable();

            }

            // get current page number
            currentPage = getCurrentPage();

            // set active page
            setActivePage(currentPage);

            // hide loader box
            hideLoad();

            // add Table stripes
            stripeRows();

        } // end redrawTable

  
        function setActivePage( number ) {
            
            // make the correct page selected
            table.find( ".table-navigation li" ).removeClass( "active" );
            table.find( ".table-navigation li:eq(" + number + ")" ).addClass( "active" );
            
            // get current rows per page
            var rowsPerPage = settings.rowsPerPage;
            
            // show rows
            var from = number * rowsPerPage;
            var to = ( number + 1 ) * rowsPerPage;
            var tableRows = table.find( "tbody tr:not(.searchhide)" ).length;
            
            table.find( "tbody tr" ).hide();
            table.find( "tbody tr:not(.searchhide)" ).slice( from, to ).show();
            
            // change
            table.find( ".table-info" ).html( "Showing " + ( from + 1 ) + " - " + ( ( tableRows < to ) ? tableRows : to ) + " of " + tableRows );
        } // end setActivePage

        function getCurrentPage() {
            
            var currentPage = ( parseInt( table.find( ".table-navigation li.active" ).find( "a" ).html() ) ) - 1;
            
            if ( isNaN( currentPage ) ) {
                
                return 0;
            }
            
            return currentPage;
        }

      
        function showLoad() {
            
            if ( settings.loadElement !== "" ) {
                
                $( settings.loadElement ).show();
            }
        }

        function hideLoad() {
            
            if ( settings.loadElement !== "" ) {
                
                if ( settings.delay > 0 ) {
                    
                    setTimeout( function() {
                        
                        $( settings.loadElement ).hide();
                    
                    }, settings.delay );
                    
                } else {
                    
                    $( settings.loadElement ).hide();
                }
            }
        }
      
        function stripHTML( oldString ) {
            
            var newString = "";
            var inTag = false;
            
            for ( var i = 0; i < oldString.length; i++ ) {
                
                if ( oldString.charAt( i ) === "<" ) inTag = true;
                
                if ( oldString.charAt( i ) === ">" ) {
                    
                    if ( oldString.charAt( i + 1 ) === "<" ) {
                        
                        // don't do anything
                    } else {
                        
                        inTag = false;
                        i++;
                    }
                }
                
                if ( !inTag ) newString += oldString.charAt( i );
            }
            return newString;
        }

        function trimString( str ) {
            
            return str.replace( /^\s\s*/, "" ).replace( /\s\s*$/, "" );
        }

        function popUp( data ) {
            
            var generator = window.open( "", "csv", "height=400, width=600" );
            generator.document.write( "<html><head><title>CSV</title>" );
            generator.document.write( "</head><body>" );
            generator.document.write( "<textarea cols=70 rows=15 wrap='off'>" );
            generator.document.write( data );
            generator.document.write( "</textarea>" );
            generator.document.write( "</body></html>" );
            generator.document.close();
            return true;
        }

        function sortAsc( a, b ) {
            
            a = a[0];
            b = b[0];
            
            // number sorter
            if ( !isNaN( a ) && !isNaN( b ) ) {
                return a - b;
            }
            
            // string sorter
            return a === b ? 0 : ( a < b ? -1 : 1 );
            
        }
        
        
        function sortDesc(a, b) {

            a = a[0];
            b = b[0];

            // Number sorter
            if (!isNaN(a) && !isNaN(b)) {
                return b - a;
            }

            // string sorter
            return a === b ? 0 : (a > b ? -1 : 1);
        }

        function getSortAction( column ) {    
            
            var columnObj = table.find( "thead th" ).eq( column );
            var currentState = columnObj.find( "#sort-type-handle" ).html();
            
            table.find( ".all-sort-type-handle" ).html( "" );
            table.find( ".sort-show-handle" ).hide();
           
            if ( currentState === "asc" ) {
                
                columnObj.find( "#sort-desc-handle" + column ).show();
                columnObj.find( "#sort-asc-handle" + column ).hide();
                columnObj.find( "#sort-type-handle" ).html( "desc" );
                return "desc";
            }

            if ( currentState === "desc" ) {
                
                columnObj.find( "#sort-asc-handle" + column ).show();
                columnObj.find( "#sort-desc-handle" + column ).hide();
                columnObj.find( "#sort-type-handle" ).html( "asc" );
                return "asc";
            }
            
            
            if ( settings.sortDefault === "asc" ) {
                
                $( "#sort-asc-handle" + column ).show();
                columnObj.find( "#sort-type-handle" ).html( "asc" );
                
            } else {
                
                $( "#sort-desc-handle" + column ).show();
                columnObj.find( "#sort-type-handle" ).html( "desc" );
            }
            
            return settings.sortDefault;
        }

        function stripeRows() {
            
            table.find( "tbody tr" ).removeClass( "odd" );
            table.find( "tbody tr" ).removeClass( "even" );
            table.find( "tbody tr:visible:even" ).addClass( "even" );
            table.find( "tbody tr:visible:odd" ).addClass( "odd" );
        }

        // return the jQuery object to allow for chainability
        return this;

    };

})(jQuery);
