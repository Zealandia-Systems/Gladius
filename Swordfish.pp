+================================================
+                                                
+ Swordfish - Vectric machine output configuration file   
+                                                
+================================================
+                                                
+ History                                        
+                                                  
+ Who      When       What                         
+ ======== ========== ===========================
+ LiamB    5/11/2021  Written from Swordfish.pp
+ ScottM   21/12/2021 Added Arc Support
+ version = "%version%";

POST_NAME = "Swordfish (*.nc)"
 
FILE_EXTENSION = "gcode"
 
UNITS = "MM"
 
+------------------------------------------------
+    Line terminating characters                 
+------------------------------------------------
 
LINE_ENDING = "[13][10]"
 
+------------------------------------------------
+    Block numbering                             
+------------------------------------------------
 
LINE_NUMBER_START     = 0
LINE_NUMBER_INCREMENT = 1
LINE_NUMBER_MAXIMUM = 999999
 
+================================================
+                                                
+    Formating for variables                     
+                                                
+================================================
 
VAR LINE_NUMBER = [N|A|N|1.0]
VAR SPINDLE_SPEED = [S|A|S|1.0]
VAR FEED_RATE = [F|C|F|1.1]
VAR X_POSITION = [X|C|X|1.4]
VAR Y_POSITION = [Y|C|Y|1.4]
VAR Z_POSITION = [Z|C|Z|1.4]
VAR ARC_CENTRE_I_INC_POSITION = [I|A|I|1.4]
VAR ARC_CENTRE_J_INC_POSITION = [J|A|J|1.4]
VAR X_HOME_POSITION = [XH|A|X|1.4]
VAR Y_HOME_POSITION = [YH|A|Y|1.4]
VAR Z_HOME_POSITION = [ZH|A|Z|1.4]

+================================================
+                                                
+    Block definitions for toolpath output       
+                                                
+================================================
 
+---------------------------------------------------
+  Commands output at the start of the file
+---------------------------------------------------
 
begin HEADER
"; [TP_FILENAME]"
"; Safe Z height: [SAFEZ]"
"; Tools: [TOOLS_USED]"
"; Notes: [FILE_NOTES]"
"; Generated [DATE] [TIME]"
" "
";[TOOLPATHS_OUTPUT]"
" "	
"G90"
"G21"
"M84 S0"
"T [T]"
"M6"
"G0 [ZH]"
"G0 [XH] [YH]"
"M3 [S]"
 
 
+---------------------------------------------------
+  Commands output for rapid moves 
+---------------------------------------------------
 
begin RAPID_MOVE
 
"G0 [X] [Y] [Z]"
 
 
+---------------------------------------------------
+  Commands output for the first feed rate move
+---------------------------------------------------
 
begin FIRST_FEED_MOVE
 
"G1 [X] [Y] [Z] [F]"
 
 
+---------------------------------------------------
+  Commands output for feed rate moves
+---------------------------------------------------
 
begin FEED_MOVE
 
"G1 [X] [Y] [Z]"
 
 
+---------------------------------------------------
+  Commands output for the first clockwise arc move
+---------------------------------------------------

begin FIRST_CW_ARC_MOVE

"G2 [X] [Y] [I] [J] [F]"
 
 
+---------------------------------------------------
+  Commands output for clockwise arc  move
+---------------------------------------------------
 
begin CW_ARC_MOVE
 
"G2 [X] [Y] [I] [J]"
 
 
+---------------------------------------------------
+  Commands output for the first counterclockwise arc move
+---------------------------------------------------
 
begin FIRST_CCW_ARC_MOVE
 
"G3 [X] [Y] [I] [J] [F]"
 
 
+---------------------------------------------------
+  Commands output for counterclockwise arc  move
+---------------------------------------------------
 
begin CCW_ARC_MOVE
 
"G3 [X] [Y] [I] [J]"
 

+---------------------------------------------------
+  Commands output for tool changes
+---------------------------------------------------

begin TOOLCHANGE

"; Tool change:"
"; Tool [T]: [TOOLNAME]"
"M5"
"T [T]"
"M6" 
"M3 [S]"



+---------------------------------------------------
+  Commands output at the end of the file
+---------------------------------------------------
 
begin FOOTER
";  COMMAND_COOLANT_OFF"
";  COMMAND_STOP_SPINDLE"
"M400"
"G0 [ZH]"
"M5" 
"G0 [XH] [YH]"
"M117 ;Job End"
