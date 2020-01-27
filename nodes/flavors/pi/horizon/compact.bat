@REM Compact the Nxt NRS database
@echo *************************************************************************
@echo * This batch file will compact and reorganize the Horizon NRS database. *
@echo * This process can take a long time.  Do not interrupt the batch        *
@echo * file or shutdown the computer until it finishes.                      *
@echo *************************************************************************

java -Xmx768m -cp "classes;lib/*;conf" -Dnxt.runtime.mode=desktop nxt.tools.CompactDatabase
