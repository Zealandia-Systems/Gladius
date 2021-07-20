/*

https://github.com/zealandia-systems/swordfish_posts_processor

*/

description = "Swordfish CNC Controller 1.0"
vendor = "Zealandia Systems";
vendorUrl = "https://github.com/zealandia-systems/swordfish_posts_processor";
certificationLevel = 2;
extension = "gcode";
setCodePage("ascii");
capabilities = CAPABILITY_MILLING | CAPABILITY_JET;
keywords = "MODEL_IMAGE PREVIEW_IMAGE";
minimumRevision = 45702;

// user-defined properties
properties = {
  jobTravelSpeedXY: 5000,              // High speed for travel movements X & Y (mm/min)
  jobTravelSpeedZ: 5000,                // High speed for travel movements Z (mm/min)

  jobUseArcs: true,                    // Produce G2/G3 for arcs

  jobSetOriginOnStart: false,           // Set origin when gcode start (G92)
  jobGoOriginOnFinish: true,           // Go X0 Y0 Z0 at gcode end

  jobSequenceNumbers: false,           // show sequence numbers
  jobSequenceNumberStart: 1,          // first sequence number
  jobSequenceNumberIncrement: 1,       // increment for sequence numbers
  jobSeparateWordsWithSpace: true,     // specifies that the words should be separated with a white space  

  toolChangeEnabled: false,          // Enable tool change code (bultin tool change requires LCD display)
  toolChangeX: 0,                   // X position for builtin tool change
  toolChangeY: 0,                   // Y position for builtin tool change
  toolChangeZ: 0,                  // Z position for builtin tool change
  toolChangeZProbe: true,           // Z probe after tool change
  toolChangeHasATC: false,

  probeOnStart: false,               // Execute probe gcode to align tool
  probeThickness: 0.8,              // plate thickness
  probeUseHomeZ: true,              // use G28 or G38 for probing 
  probeG38Target: -10,              // probing up to pos 
  probeG38Speed: 30,                // probing with speed 

  gcodeStartFile: "",               // File with custom Gcode for header/start (in nc folder)
  gcodeStopFile: "",                // File with custom Gcode for footer/end (in nc folder)
  gcodeToolFile: "",                // File with custom Gcode for tool change (in nc folder)
  gcodeProbeFile: "",               // File with custom Gcode for tool probe (in nc folder)

  commentWriteTools: true,
  commentActivities: true,
  commentSections: true,
  commentCommands: true,
  commentMovements: true,
};

propertyDefinitions = {
  jobFirmware: {
    title: "Job: Firmware", description: "GCode output mode", group: 4,
    type: "integer", default_mm: 0, default_in: 0,
    values: [
      { title: "Swordfish 1.0", id: 0 }
    ]
  },
  jobTravelSpeedXY: {
    title: "Job: Travel speed X/Y", description: "High speed for travel movements X & Y (mm/min; in/min)", group: 1,
    type: "spatial", default_mm: 8000, default_in: 315
  },
  jobTravelSpeedZ: {
    title: "Job: Travel Speed Z", description: "High speed for travel movements z (mm/min; in/min)", group: 1,
    type: "spatial", default_mm: 8000, default_in: 315
  },
  jobUseArcs: {
    title: "Job: Use Arcs", description: "Use G2/G3 g-codes fo circular movements", group: 1,
    type: "boolean", default_mm: true, default_in: true
  },

  jobMarlinEnforceFeedrate: {
    title: "Job: Marlin: Enforce Feedrate", description: "Add feedrate to each movement g-code", group: 1,
    type: "boolean", default_mm: false, default_in: false
  },

  jobSetOriginOnStart: {
    title: "Job: Reset on start (G92)", description: "Set origin when gcode start (G92)", group: 1,
    type: "boolean", default_mm: false, default_in: false
  },
/*
  jobSequenceNumbers: {
    title: "Job: Line numbers", description: "Show sequence numbers", group: 1,
    type: "boolean", default_mm: false, default_in: false
  },
  jobSequenceNumberStart: {
    title: "Job: Line start", description: "First sequence number", group: 1,
    type: "integer", default_mm: 1, default_in: 1
  },
  jobSequenceNumberIncrement: {
    title: "Job: Line increment", description: "Increment for sequence numbers", group: 1,
    type: "integer", default_mm: 1, default_in: 1
  },
*/
  jobSeparateWordsWithSpace: {
    title: "Job: Separate words", description: "Specifies that the words should be separated with a white space", group: 1,
    type: "boolean", default_mm: true, default_in: true
  },
  toolChangeEnabled: {
    title: "Tool Change: Enabled", description: "Enable tool change code (bultin tool change requires LCD display)", group: 2,
    type: "boolean", default_mm: false, default_in: false
  },
  toolChangeZProbe: {
    title: "Tool Change: Make Z Probe", description: "Z probe after tool change", group: 2,
    type: "boolean", default_mm: true, default_in: true
  },
  toolChangeHasATC: {
    title: "Tool Change: Machine has ATC", description: "Let the machine perform the tool change", group: 2,
    type: "boolean", default_mm: false, default_in: false
  },
  toolChangeX: {
    title: "Tool Change: X", description: "X position for builtin tool change", group: 2,
    type: "spatial", default_mm: 0, default_in: 0
  },
  toolChangeY: {
    title: "Tool Change: Y", description: "Y position for builtin tool change", group: 2,
    type: "spatial", default_mm: 0, default_in: 0
  },
  toolChangeZ: {
    title: "Tool Change: Z ", description: "Z position for builtin tool change", group: 2,
    type: "spatial", default_mm: 40, default_in: 1.6
  },
  probeOnStart: {
    title: "Probe: On job start", description: "Execute probe gcode on job start", group: 3,
    type: "boolean", default_mm: false, default_in: false
  },
  probeThickness: {
    title: "Probe: Plate thickness", description: "Plate thickness", group: 3,
    type: "spatial", default_mm: 0.8, default_in: 0.032
  },
  probeUseHomeZ: {
    title: "Probe: Use Home Z", description: "Use G28 or G38 for probing", group: 3,
    type: "boolean", default_mm: true, default_in: true
  },
  probeG38Target: {
    title: "Probe: G38 target", description: "Probing up to Z position", group: 3,
    type: "spatial", default_mm: -10, default_in: -0.5
  },
  probeG38Speed: {
    title: "Probe: G38 speed", description: "Probing with speed (mm/min; in/min)", group: 3,
    type: "spatial", default_mm: 30, default_in: 1.2
  },
  gcodeStartFile: {
    title: "Extern: Start File", description: "File with custom Gcode for header/start (in nc folder)", group: 5,
    type: "file", default_mm: "", default_in: ""
  },
  gcodeStopFile: {
    title: "Extern: Stop File", description: "File with custom Gcode for footer/end (in nc folder)", group: 5,
    type: "file", default_mm: "", default_in: ""
  },
  gcodeToolFile: {
    title: "Extern: Tool File", description: "File with custom Gcode for tool change (in nc folder)", group: 5,
    type: "file", default_mm: "", default_in: ""
  },
  gcodeProbeFile: {
    title: "Extern: Probe File", description: "File with custom Gcode for tool probe (in nc folder)", group: 5,
    type: "file", default_mm: "", default_in: ""
  },
  commentWriteTools: {
    title: "Comment: Write Tools", description: "Write table of used tools in job header", group: 7,
    type: "boolean", default_mm: true, default_in: true
  },
  commentActivities: {
    title: "Comment: Activities", description: "Write comments which somehow helps to understand current piece of g-code", group: 7,
    type: "boolean", default_mm: true, default_in: true
  },
  commentSections: {
    title: "Comment: Sections", description: "Write header of every section", group: 7,
    type: "boolean", default_mm: true, default_in: true
  },
  commentCommands: {
    title: "Comment: Trace Commands", description: "Write stringified commands called by CAM", group: 7,
    type: "boolean", default_mm: true, default_in: true
  },
  commentMovements: {
    title: "Comment: Trace Movements", description: "Write stringified movements called by CAM", group: 7,
    type: "boolean", default_mm: true, default_in: true
  },

};

let sequenceNumber;

// Formats
let G = createFormat({ prefix: "G", decimals: 1 });
let M = createFormat({ prefix: "M", decimals: 0 });

let XYZ = createFormat({ decimals: (unit == MM ? 3 : 4) });
let X = createFormat({ prefix: "X", decimals: (unit == MM ? 3 : 4) });
let Y = createFormat({ prefix: "Y", decimals: (unit == MM ? 3 : 4) });
let Z = createFormat({ prefix: "Z", decimals: (unit == MM ? 3 : 4) });
let I = createFormat({ prefix: "I", decimals: (unit == MM ? 3 : 4) });
let J = createFormat({ prefix: "J", decimals: (unit == MM ? 3 : 4) });
let K = createFormat({ prefix: "K", decimals: (unit == MM ? 3 : 4) });

let speedFormat = createFormat({ decimals: 0 });
let S = createFormat({ prefix: "S", decimals: 0 });

let P = createFormat({ prefix: "P", decimals: 0 });
let O = createFormat({ prefix: "O", decimals: 0 });
let L = createFormat({ prefix: "L", decimals: 0 });
let H = createFormat({ prefix: "H", decimals: 0 });

let feedFormat = createFormat({ decimals: (unit == MM ? 0 : 2) });
let F = createFormat({ prefix: "F", decimals: (unit == MM ? 0 : 2) });

let toolFormat = createFormat({ decimals: 0 });
let T = createFormat({ prefix: "T", decimals: 0 });

let taperFormat = createFormat({ decimals: 1, scale: DEG });
let secFormat = createFormat({ decimals: 3, forceDecimal: true }); // seconds - range 0.001-1000

// Linear outputs
let xOutput = createVariable({}, X);
let yOutput = createVariable({}, Y);
let zOutput = createVariable({}, Z);
let fOutput = createVariable({}, F);
let sOutput = createVariable({ force: true }, S);

// Circular outputs
let iOutput = createReferenceVariable({}, I);
let jOutput = createReferenceVariable({}, J);
let kOutput = createReferenceVariable({}, K);

// Arc support variables
minimumChordLength = spatial(0.01, MM);
minimumCircularRadius = spatial(0.01, MM);
maximumCircularRadius = spatial(1000, MM);
minimumCircularSweep = toRad(0.01);
maximumCircularSweep = toRad(180);
allowHelicalMoves = false;
allowedCircularPlanes = undefined;

/**
  Writes the specified block.
*/
function writeBlock() {
  if (properties.jobSequenceNumbers) {
    writeWords2("N" + sequenceNumber, arguments);
    sequenceNumber += properties.jobSequenceNumberIncrement;
  } else {
    writeWords(arguments);
  }
}

// Called in every new gcode file
function onOpen() {
  sequenceNumber = properties.jobSequenceNumberStart;
  if (!properties.jobSeparateWordsWithSpace) {
    setWordSeparator("");
  }
}

// Called at end of gcode file
function onClose() {
  writeActivityComment(" *** STOP begin ***");
  flushMotions();

  if (properties.gcodeStopFile == "") {
    onCommand(COMMAND_COOLANT_OFF);
    onCommand(COMMAND_STOP_SPINDLE);

    displayText("Job end");
    writeActivityComment(" *** STOP end ***");
  } else {
    loadFile(properties.gcodeStopFile);
  }
}

let cutterOnCurrentPower;

function onSection() {
  // Write Start gcode of the documment (after the "onParameters" with the global info)
  if (isFirstSection()) {
    writeFirstSection();
  }
  writeActivityComment(" *** SECTION begin ***");

  // Tool change
  if (properties.toolChangeEnabled && !isFirstSection() && tool.number != getPreviousSection().getTool().number) {
    if (properties.gcodeToolFile == "") {
      // Builtin tool change gcode
      writeActivityComment(" --- CHANGE TOOL begin ---");
      toolChange();
      writeActivityComment(" --- CHANGE TOOL end ---");
    } else {
      // Custom tool change gcode
      loadFile(properties.gcodeToolFile);
    }
  }

  if (properties.commentSections) {
    // Machining type
    if (currentSection.type == TYPE_MILLING) {
      // Specific milling code
      writeComment(sectionComment + " - Milling - Tool: " + tool.number + " - " + tool.comment + " " + getToolTypeName(tool.type));
    }

    if (currentSection.type == TYPE_JET) {
      // Cutter mode used for different cutting power in PWM laser
      switch (currentSection.jetMode) {
        case JET_MODE_THROUGH:
          cutterOnCurrentPower = properties.cutterOnThrough;
          break;
        case JET_MODE_ETCHING:
          cutterOnCurrentPower = properties.cutterOnEtch;
          break;
        case JET_MODE_VAPORIZE:
          cutterOnCurrentPower = properties.cutterOnVaporize;
          break;
        default:
          error("Cutting mode is not supported.");
      }
      writeComment(sectionComment + " - Laser/Plasma - Cutting mode: " + getParameter("operation:cuttingMode"));
    }

    // Print min/max boundaries for each section
    vectorX = new Vector(1, 0, 0);
    vectorY = new Vector(0, 1, 0);
    writeComment(" X Min: " + XYZ.format(currentSection.getGlobalRange(vectorX).getMinimum()) + " - X Max: " + XYZ.format(currentSection.getGlobalRange(vectorX).getMaximum()));
    writeComment(" Y Min: " + XYZ.format(currentSection.getGlobalRange(vectorY).getMinimum()) + " - Y Max: " + XYZ.format(currentSection.getGlobalRange(vectorY).getMaximum()));
    writeComment(" Z Min: " + XYZ.format(currentSection.getGlobalZRange().getMinimum()) + " - Z Max: " + XYZ.format(currentSection.getGlobalZRange().getMaximum()));
  }

  onCommand(COMMAND_START_SPINDLE);
  onCommand(COMMAND_COOLANT_ON);
  // Display section name in LCD
  displayText(" " + sectionComment);
}

function resetAll() {
  xOutput.reset();
  yOutput.reset();
  zOutput.reset();
  fOutput.reset();
}

// Called in every section end
function onSectionEnd() {
  resetAll();
  writeActivityComment(" *** SECTION end ***");
  writeln("");
}

function onComment(message) {
  writeComment(message);
}

let pendingRadiusCompensation = RADIUS_COMPENSATION_OFF;

function onRadiusCompensation() {
  pendingRadiusCompensation = radiusCompensation;
}

// Rapid movements
function onRapid(_x, _y, _z) {
  if (pendingRadiusCompensation != RADIUS_COMPENSATION_OFF) {
    error(localize("Radius compensation mode cannot be changed at rapid traversal."));
    return;
  }

  let z = zOutput.format(_z);
  let x = xOutput.format(_x);
  let y = yOutput.format(_y);

  if (z) {
    f = fOutput.format(propertyMmToUnit(properties.jobTravelSpeedZ));
    writeBlock(G.format(0), z, f);
  }
  
  if (x || y) {
    f = fOutput.format(propertyMmToUnit(properties.jobTravelSpeedXY));
    writeBlock(G.format(0), x, y, f);
  }
}

// Feed movements
function onLinear(_x, _y, _z, _feed) {
  if (pendingRadiusCompensation != RADIUS_COMPENSATION_OFF) {
    // ensure that we end at desired position when compensation is turned off
    xOutput.reset();
    yOutput.reset();
  }  
  let x = xOutput.format(_x);
  let y = yOutput.format(_y);
  let z = zOutput.format(_z);
  let f = fOutput.format(_feed);
  if (x || y || z) {
    if (pendingRadiusCompensation != RADIUS_COMPENSATION_OFF) {
      error(localize("Radius compensation mode is not supported."));
      return;
    } else {
      writeBlock(G.format(1), x, y, z, f);
    }    
  } else if (f) {
    if (getNextRecord().isMotion()) { // try not to output feed without motion
      fOutput.reset(); // force feed on next line
    } else {
      writeBlock(G.format(1), f);
    }
  }
}

function onRapid5D(_x, _y, _z, _a, _b, _c) {
  error(localize("Multi-axis motion is not supported."));
}

function onLinear5D(_x, _y, _z, _a, _b, _c, feed) {
  error(localize("Multi-axis motion is not supported."));
}

function onCircular(clockwise, cx, cy, cz, x, y, z, feed) {
  if (pendingRadiusCompensation != RADIUS_COMPENSATION_OFF) {
    error(localize("Radius compensation cannot be activated/deactivated for a circular move."));
    return;
  }

  if (!properties.jobUseArcs || isHelical()) {
    linearize(tolerance);

    return;
  }

  let start = getCurrentPosition();

  if((cx - start.x) == 0 && (cy - start.y) == 0) {
    linearize(tolerance);
  } else if (isFullCircle()) {
    switch (getCircularPlane()) {
      case PLANE_XY: {
        writeBlock(G.format(17), G.format(clockwise ? 2 : 3), xOutput.format(x), iOutput.format(cx - start.x, 0), jOutput.format(cy - start.y, 0), fOutput.format(feed));
        
        break;
      }

      case PLANE_ZX: {
        writeBlock(G.format(18), G.format(clockwise ? 2 : 3), xOutput.format(x), kOutput.format(cx - start.x, 0), iOutput.format(cy - start.y, 0), fOutput.format(feed));

        break;
      }

      case PLANE_YZ: {
        writeBlock(G.format(19), G.format(clockwise ? 2 : 3), xOutput.format(x), jOutput.format(cx - start.x, 0), kOutput.format(cy - start.y, 0), fOutput.format(feed));
        
        break;
      }

      default: {
        linearize(tolerance);
      }
    }
  } else {
    switch (getCircularPlane()) {
      case PLANE_XY: {
        writeBlock(G.format(17), G.format(clockwise ? 2 : 3), xOutput.format(x), yOutput.format(y), zOutput.format(z), iOutput.format(cx - start.x, 0), jOutput.format(cy - start.y, 0), fOutput.format(feed));

        break;
      }

      case PLANE_ZX: {
        writeBlock(G.format(18), G.format(clockwise ? 2 : 3), xOutput.format(x), yOutput.format(y), zOutput.format(z), kOutput.format(cx - start.x, 0), iOutput.format(cy - start.y, 0), fOutput.format(feed));

        break;
      }

      case PLANE_YZ: {
        writeBlock(G.format(19), G.format(clockwise ? 2 : 3), xOutput.format(x), yOutput.format(y), zOutput.format(z), jOutput.format(cx - start.x, 0), kOutput.format(cy - start.y, 0), fOutput.format(feed));

        break;
      }

      default: {
        linearize(tolerance);
      }
    }
  }
}

// Called on waterjet/plasma/laser cuts
let powerState = false;

function onPower(power) {
  if (power != powerState) {
    if (power) {
      writeActivityComment(" >>> LASER Power ON");
      
    } else {
      writeActivityComment(" >>> LASER Power OFF");
      
    }
    powerState = power;
  }
}

// Called on Dwell Manual NC invocation
function onDwell(seconds) {
  if (seconds > 99999.999) {
    warning(localize("Dwelling time is out of range."));
  }
  writeActivityComment(" >>> Dwell");
  writeBlock(G.format(4), "S" + secFormat.format(seconds));
}

// Called with every parameter in the documment/section
function onParameter(name, value) {
  // Write gcode initial info
  // Product version
  if (name == "generated-by") {
    writeComment(value);
    writeComment(" Posts processor: " + FileSystem.getFilename(getConfigurationPath()));
  }
  // Date
  if (name == "generated-at") {
    writeComment(" Gcode generated: " + value + " GMT");
  }

  // Document
  if (name == "document-path") {
    writeComment(" Document: " + value);
  }

  // Setup
  if (name == "job-description") {
    writeComment(" Setup: " + value);
  }

  // Get section comment
  if (name == "operation-comment") {
    sectionComment = value;
  }
}

function onMovement(movement) {
  if (properties.commentMovements) {
    let jet = tool.isJetTool && tool.isJetTool();
    let id;
    switch (movement) {
      case MOVEMENT_RAPID:
        id = "MOVEMENT_RAPID";
        break;
      case MOVEMENT_LEAD_IN:
        id = "MOVEMENT_LEAD_IN";
        break;
      case MOVEMENT_CUTTING:
        id = "MOVEMENT_CUTTING";
        break;
      case MOVEMENT_LEAD_OUT:
        id = "MOVEMENT_LEAD_OUT";
        break;
      case MOVEMENT_LINK_TRANSITION:
        id = jet ? "MOVEMENT_BRIDGING" : "MOVEMENT_LINK_TRANSITION";
        break;
      case MOVEMENT_LINK_DIRECT:
        id = "MOVEMENT_LINK_DIRECT";
        break;
      case MOVEMENT_RAMP_HELIX:
        id = jet ? "MOVEMENT_PIERCE_CIRCULAR" : "MOVEMENT_RAMP_HELIX";
        break;
      case MOVEMENT_RAMP_PROFILE:
        id = jet ? "MOVEMENT_PIERCE_PROFILE" : "MOVEMENT_RAMP_PROFILE";
        break;
      case MOVEMENT_RAMP_ZIG_ZAG:
        id = jet ? "MOVEMENT_PIERCE_LINEAR" : "MOVEMENT_RAMP_ZIG_ZAG";
        break;
      case MOVEMENT_RAMP:
        id = "MOVEMENT_RAMP";
        break;
      case MOVEMENT_PLUNGE:
        id = jet ? "MOVEMENT_PIERCE" : "MOVEMENT_PLUNGE";
        break;
      case MOVEMENT_PREDRILL:
        id = "MOVEMENT_PREDRILL";
        break;
      case MOVEMENT_EXTENDED:
        id = "MOVEMENT_EXTENDED";
        break;
      case MOVEMENT_REDUCED:
        id = "MOVEMENT_REDUCED";
        break;
      case MOVEMENT_HIGH_FEED:
        id = "MOVEMENT_HIGH_FEED";
        break;
      case MOVEMENT_FINISH_CUTTING:
        id = "MOVEMENT_FINISH_CUTTING";
        break;
    }
    if (id == undefined) {
      id = String(movement);
    }
    writeComment(" " + id);
  }
}

let currentSpindleSpeed = 0;
let currentSpindleClockwise = 0;

function setSpindleSpeed(_spindleSpeed, _clockwise) {
  if (currentSpindleSpeed != _spindleSpeed) {
    if (_spindleSpeed > 0) {
      if(currentSpindleClockwise != _clockwise && currentSpindleSpeed > 0) {
        writeComment('Stop the spindle before changing direction.');
        writeBlock(M.format(5));
      }

      const code = _clockwise ? 3 : 4;

      writeBlock(M.format(code), S.format(_spindleSpeed));
    } else {
      writeBlock(M.format(5));
    }

    currentSpindleSpeed = _spindleSpeed;
  }
}

function onSpindleSpeed(spindleSpeed) {
  setSpindleSpeed(spindleSpeed, tool.clockwise);
}

function onCommand(command) {
  if (properties.commentActivities) {
    let stringId = getCommandStringId(command);
    writeComment(" " + stringId);
  }
  switch (command) {
    case COMMAND_START_SPINDLE:
      onCommand(tool.clockwise ? COMMAND_SPINDLE_CLOCKWISE : COMMAND_SPINDLE_COUNTERCLOCKWISE);
      return;
    case COMMAND_SPINDLE_CLOCKWISE:
      if (tool.jetTool)
        return;
      setSpindleSpeed(spindleSpeed, true);
      return;
    case COMMAND_SPINDLE_COUNTERCLOCKWISE:
      if (tool.jetTool)
        return;
      setSpindleSpeed(spindleSpeed, false);
      return;
    case COMMAND_STOP_SPINDLE:
      if (tool.jetTool)
        return;
      setSpindleSpeed(0, true);
      return;
    case COMMAND_COOLANT_ON:
      setCoolant(tool.coolant);
      return;
    case COMMAND_COOLANT_OFF:
      setCoolant(0);  //COOLANT_DISABLED
      return;
    case COMMAND_LOCK_MULTI_AXIS:
      return;
    case COMMAND_UNLOCK_MULTI_AXIS:
      return;
    case COMMAND_BREAK_CONTROL:
      return;
    case COMMAND_TOOL_MEASURE: {
      if (tool.jetTool) {
        return;
      }

      writeBlock(G.format(49));
      writeBlock(G.format(53), G.format(0), Z.format(0));
      writeBlock(G.format(59.9), G.format(0), X.format(0), Y.format(0));
      writeBlock(G.format(37));
      writeBlock(G.format(59.9), G.format(10), L.format(10), P.format(tool.number));
      writeBlock(G.format(43), H.format(tool.number));

      return;
    }
    case COMMAND_STOP:
      writeBlock(M.format(0));
      return;
  }
}

function writeFirstSection() {
  // dump tool information
  let toolZRanges = {};
  let vectorX = new Vector(1, 0, 0);
  let vectorY = new Vector(0, 1, 0);
  let ranges = {
    x: { min: undefined, max: undefined },
    y: { min: undefined, max: undefined },
    z: { min: undefined, max: undefined },
  };
  let handleMinMax = function(pair, range) {
    let rmin = range.getMinimum();
    let rmax = range.getMaximum();
    if (pair.min == undefined || pair.min > rmin) {
      pair.min = rmin;
    }
    if (pair.max == undefined || pair.max < rmax) {
      pair.max = rmax;
    }
  }
  
  let numberOfSections = getNumberOfSections();
  for (let i = 0; i < numberOfSections; ++i) {
    let section = getSection(i);
    let tool = section.getTool();
    let zRange = section.getGlobalZRange();
    let xRange = section.getGlobalRange(vectorX);
    let yRange = section.getGlobalRange(vectorY);
    handleMinMax(ranges.x, xRange);
    handleMinMax(ranges.y, yRange);
    handleMinMax(ranges.z, zRange);
    if (is3D() && properties.commentWriteTools) {
      if (toolZRanges[tool.number]) {
        toolZRanges[tool.number].expandToRange(zRange);
      } else {
        toolZRanges[tool.number] = zRange;
      }
    }
  }

  writeComment(" ");
  writeComment(" Ranges table:");
  writeComment(" X: Min=" + XYZ.format(ranges.x.min) + " Max=" + XYZ.format(ranges.x.max) + " Size=" + XYZ.format(ranges.x.max - ranges.x.min));
  writeComment(" Y: Min=" + XYZ.format(ranges.y.min) + " Max=" + XYZ.format(ranges.y.max) + " Size=" + XYZ.format(ranges.y.max - ranges.y.min));
  writeComment(" Z: Min=" + XYZ.format(ranges.z.min) + " Max=" + XYZ.format(ranges.z.max) + " Size=" + XYZ.format(ranges.z.max - ranges.z.min));

  if (properties.commentWriteTools) {
    writeComment(" ");
    writeComment(" Tools table:");
    let tools = getToolTable();
    if (tools.getNumberOfTools() > 0) {
      for (let i = 0; i < tools.getNumberOfTools(); ++i) {
        let tool = tools.getTool(i);
        let comment = " T" + toolFormat.format(tool.number) + " D=" + XYZ.format(tool.diameter) + " CR=" + XYZ.format(tool.cornerRadius);
        if ((tool.taperAngle > 0) && (tool.taperAngle < Math.PI)) {
          comment += " TAPER=" + taperFormat.format(tool.taperAngle) + "deg";
        }
        if (toolZRanges[tool.number]) {
          comment += " - ZMIN=" + XYZ.format(toolZRanges[tool.number].getMinimum());
        }
        comment += " - " + getToolTypeName(tool.type) + " " + tool.comment;
        writeComment(comment);
      }
    }
  }

  let toolRenderer = createToolRenderer();
  if (toolRenderer) {
    toolRenderer.setBackgroundColor(new Color(1, 1, 1));
    toolRenderer.setFluteColor(new Color(40.0 / 255, 40.0 / 255, 40.0 / 255));
    toolRenderer.setShoulderColor(new Color(80.0 / 255, 80.0 / 255, 80.0 / 255));
    toolRenderer.setShaftColor(new Color(80.0 / 255, 80.0 / 255, 80.0 / 255));
    toolRenderer.setHolderColor(new Color(40.0 / 255, 40.0 / 255, 40.0 / 255));
    toolRenderer.setBackgroundColor(new Color(240 / 255.0, 240 / 255.0, 240 / 255.0));
    let path = "tool" + tool.number + ".png";
    let width = 400;
    let height = 532;
    toolRenderer.exportAs(path, "image/png", tool, width, height);
  }

  writeln("");
  writeActivityComment(" *** START begin ***");

  if (properties.gcodeStartFile == "") {
    writeBlock(G.format(90)); // Set to Absolute Positioning
    writeBlock(G.format(unit == IN ? 20 : 21));
    writeBlock(M.format(84), S.format(0)); // Disable steppers timeout
    if (properties.jobSetOriginOnStart) {
      writeBlock(G.format(92), X.format(0), Y.format(0), Z.format(0)); // Set origin to initial position
    }
    if (properties.probeOnStart && tool.number != 0 && !tool.jetTool) {
      onCommand(COMMAND_TOOL_MEASURE);
    }
  } else {
    loadFile(properties.gcodeStartFile);
  }
  writeActivityComment(" *** START end ***");
  writeln("");
}

// Output a comment
function writeComment(text) {
  writeBlock('; ' + text.replace(/(\(|\))/g, ''));
}

// Test if file exist/can read and load it
function loadFile(_file) {
  let folder = FileSystem.getFolderPath(getOutputPath()) + PATH_SEPARATOR;
  if (FileSystem.isFile(folder + _file)) {
    let txt = loadText(folder + _file, "utf-8");
    if (txt.length > 0) {
      writeActivityComment(" --- Start custom gcode " + folder + _file);
      write(txt);
      writeActivityComment(" --- End custom gcode " + folder + _file);
      writeln("");
    }
  } else {
    writeComment(" Can't open file " + folder + _file);
    error("Can't open file " + folder + _file);
  }
}

let currentCoolantMode = 0;

// Manage coolant state 
function setCoolant(coolant) {
  if (currentCoolantMode == coolant) {
    return;
  }
  if (properties.coolantA_Mode != 0) {
    if (currentCoolantMode == properties.coolantA_Mode) {
      writeActivityComment(" >>> Coolant A OFF");
      writeBlock(M.format(7));
    } else if (coolant == properties.coolantA_Mode) {
      writeActivityComment(" >>> Coolant A ON");
      writeBlock(M.format(9));
    }
  }
  if (properties.coolantB_Mode != 0) {
    if (currentCoolantMode == properties.coolantB_Mode) {
      writeActivityComment(" >>> Coolant B OFF");
      writeBlock(M.format(8));
    } else if (coolant == properties.coolantB_Mode) {
      writeActivityComment(" >>> Coolant B ON");
      writeBlock(M.format(9));
    }
  }
  currentCoolantMode = coolant;
}

function propertyMmToUnit(_v) {
  return (_v / (unit == IN ? 25.4 : 1));
}

function writeActivityComment(_comment) {
  if (properties.commentActivities) {
    writeComment(_comment);
  }
}

function flushMotions() {
  writeBlock(M.format(400));
}

function displayText(txt) {
  writeBlock(M.format(117), (properties.jobSeparateWordsWithSpace ? "" : " ") + txt);
}

function toolChange() {
  flushMotions();

  // turn off spindle and coolant
  onCommand(COMMAND_COOLANT_OFF);
  onCommand(COMMAND_STOP_SPINDLE);

  if(!properties.toolChangeHasATC) {
    writeComment('Move to specified tool change location.');
    writeBlock(G.format(53), G.format(0), Z.format(properties.toolChangeZ));
    writeBlock(G.format(53), G.format(0), X.format(properties.toolChangeX), Y.format(properties.toolChangeY));
    flushMotions();
  }

  writeBlock(T.format(tool.number));
  writeBlock(M.format(6));

  // Run Z probe gcode
  if (properties.toolChangeZProbe && tool.number != 0) {
    onCommand(COMMAND_TOOL_MEASURE);
  }
}
