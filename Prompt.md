Reconstruct the LEGO Technic set 42197 backhoe loader, using exactly the
parts inventory below, and return its full assembled construction as JSON.
This is a spatial and mechanical reasoning benchmark.
Return JSON only: no markdown, explanations, code, or images.
Do not use external tools or files inside this folder or outside to complete the task. Work from this brief only.

THE MODEL

A compact yellow backhoe loader, about 104 Technic pieces, with:
- Chassis: two yellow 1x9 thick beams as the left and right side rails.
  Each rail carries two tan 3L pins (at holes h1 and h7, so the wheelbase
  is 6 modules) on which the wheels spin freely.
- Four wheels: a black 30.4x14 tyre on a light-gray 18x14 rim, pushed onto
  the tan pins. Wheel diameter is 3.8 modules. All four tyres touch z=0.
- Open cab on the chassis: two black quarter-ellipse frames as the rear
  arches, two black thin 1x5 liftarms as the front pillars, a yellow curved
  panel roof carried on yellow 3L axles, yellow thin 1x5 and 1x3 cross
  bars, two headlights (black cross block + light-gray 1/2 pin +
  trans-clear 1x1 round lens) at the top front corners, and two small
  yellow fairings (#7 and #8, a mirror pair) as fenders or steps.
- Drive tower inside the cab: a black 12-tooth double-bevel gear on top
  of the cab is a hand knob. It sits on a reddish-brown 3L axle that
  continues down through a dark-gray axle connector into a dark-gray 4L
  axle. A black knob wheel is at the bottom of that axle. Two yellow axle
  connectors with a centre pin hole sit on the vertical shaft and carry
  axles that brace the cab frames.
- Loader gearbox (front): two yellow quarter-ellipse frames enclose a
  reddish-brown 5L axle, running front to back. It carries a light-gray
  worm and, at its rear end, a black knob wheel that meshes with the knob
  wheel at the bottom of the tower. The worm drives a dark-gray 8-tooth
  gear on a transverse light-gray 5L axle, with a light-gray half bush on
  each side. Two yellow 1x7 bent liftarms (the loader arms) are locked to
  that transverse axle.
- Loader: the front ends of the loader arms hold a transverse 5L axle with
  two black cross blocks and a black round 1L spacer. A light-gray bracket
  and the black toothed loader bucket are mounted there. The bucket can
  also be tilted by hand.
- Backhoe (rear): two yellow 1x7 bent liftarms joined by blue axle-pins
  form the boom and dipper. A black ball-joint arm is fixed to the boom
  base with a red 2L axle, and its ball snaps into a dark-gray ball-socket
  connector at the rear of the chassis, so the whole backhoe can swing
  and pivot. The digging bucket is a black curved panel on a black pin
  hub with two perpendicular axles, at the dipper tip.
- Stabilizers: two yellow 1x5 thick beams on black friction pins at the
  rear corners. They swing down to brace the machine.

Required functions:
F1 Turning the top knob rotates the vertical shaft. The knob wheels turn
   the worm axle, the worm turns the 8-tooth gear, and the loader arms
   rise or fall. The worm must hold the arms in place (self-locking).
F2 The four wheels roll freely.
F3 The backhoe swivels on the ball joint.
F4 Each stabilizer leg pivots on its pin.
F5 The loader bucket can be tilted by hand.

Pose the model as in the finished-model picture: loader bucket lowered
in front, backhoe raised behind the cab, stabilizers angled down toward
the rear, and wheels on the ground.

EXACT INVENTORY (104 pieces, 45 element types)

Use every piece exactly once. Add no other parts. Colors are fixed.
Format: element | qty | color | part.

6321305 | 4 | tan               | pin 3L without friction
4142865 | 5 | red               | axle 2L notched
4206482 | 6 | blue              | axle-pin with friction (1L pin + 1L axle)
6299413 | 1 | blue              | pin 3L with friction
6510995 | 1 | yellow            | small fairing #7
6513879 | 1 | yellow            | small fairing #8 (mirror of #7)
6130007 | 8 | yellow            | axle 3L
6344174 | 2 | yellow            | thin liftarm 1x3 (axle holes at ends)
6344325 | 2 | yellow            | axle connector 3L with centre pin hole
6334491 | 1 | yellow            | curved panel 3x1 (cab roof)
6522621 | 2 | yellow            | quarter-ellipse frame 3x5
6371968 | 2 | yellow            | thin liftarm 1x5 (axle holes at ends)
4142133 | 2 | yellow            | thick beam 1x5
6271828 | 2 | yellow            | thick L-liftarm 2x4
6278131 | 4 | yellow            | thick liftarm 1x7 bent 53.13 deg (4-4)
6115616 | 2 | yellow            | thick beam 1x9
6121485 | 3 | black             | round pin connector 1L (spacer)
4177431 | 1 | black             | gear 12-tooth double bevel (top knob)
6261371 | 8 | black             | cross block: axle hole + perpendicular pin hole, 2L
6279875 | 4 | black             | pin 2L with friction
6099801 | 1 | black             | pin hub with 2 perpendicular axle stubs
6331716 | 1 | black             | perpendicular connector 2L with 2 axle holes
6284188 | 2 | black             | knob wheel (4 knobs)
6331026 | 1 | black             | curved panel 3x1 (digging bucket)
6338171 | 1 | black             | ball-joint arm (axle hole, pin hole, ball end)
4619323 | 4 | black             | tyre 30.4x14
6327162 | 2 | black             | quarter-ellipse frame 3x5
6327028 | 2 | black             | thin liftarm 1x5 (axle holes at ends)
6311434 | 1 | black             | loader bucket with teeth
6135494 | 1 | reddish_brown     | axle 3L with stop
6159763 | 1 | reddish_brown     | axle 5L with stop
6271165 | 2 | light_bluish_gray | half bush
4211483 | 2 | light_bluish_gray | pin 1/2 (stud end)
6185471 | 1 | light_bluish_gray | worm gear
6413107 | 1 | light_bluish_gray | bucket bracket with two pins
6109684 | 4 | light_bluish_gray | wheel rim 18x14 with pin hole
6331574 | 2 | light_bluish_gray | thin crank liftarm (axle hole, 2 pin holes, boss)
6514191 | 2 | trans_clear       | round 1x1 (headlight lens)
6012451 | 1 | dark_bluish_gray  | gear 8-tooth
6338422 | 2 | dark_bluish_gray  | thin liftarm 1x2 (2 axle holes)
6276984 | 1 | dark_bluish_gray  | perpendicular connector 3L (axle, pin, axle)
6391550 | 2 | dark_bluish_gray  | axle connector 2L
6360824 | 1 | dark_bluish_gray  | ball-socket connector (axle holes + ball socket)
6083620 | 1 | dark_bluish_gray  | axle 4L with stop
4211639 | 4 | light_bluish_gray | axle 5L

COORDINATES

- Unit: 1 module = one Technic hole pitch (8 mm).
- x = vehicle right, y = vehicle forward (loader side), z = up.
- The ground is z=0. Centre the model roughly on x=0.
- Each part has a local frame. Place it with:
  position = world coordinates of the local origin,
  x_axis   = world unit vector of local +x,
  z_axis   = world unit vector of local +z (must be orthogonal to x_axis).
  Hinged parts (loader arms, backhoe, stabilizers, bucket) may use
  non-axis-aligned unit vectors; round components to 4 decimals.

PARTS CATALOG (local geometry and feature names)

P = round pin hole (spins freely). A = cross axle hole (locks rotation).

Shafts lie along local +x, starting at x=0:
- axle nL: segment s0 = [0,n], cross profile. With stop: the stop is at
  x=0 and cannot pass through a hole.
- pin 3L (tan, blue 6299413): s0 = [0,1], collar at x=1, s1 = [1,3].
- pin 2L friction (black): s0 = [0,1], s1 = [1,2].
- axle-pin (blue): s0 = pin [0,1], s1 = axle [1,2].
- pin 1/2: s0 = pin [0,0.5]; feature "stud" at the other end.

Liftarms: holes lie in the local x-y plane, hole axes along local z,
and h0 is at the origin. Thick = 1 deep, thin = 0.5 deep.
- beam 1x9: h0..h8 P at (i,0).
- beam 1x5: h0..h4 P at (i,0).
- thin 1x5: h0 A, h1-h3 P, h4 A at (i,0).
- thin 1x3: h0 A, h1 P, h2 A at (i,0).
- thin 1x2: h0 A, h1 A at (i,0).
- L 2x4: h0 A (0,0), h1 P (1,0), h2 P (2,0), h3 P (3,0) corner, h4 P (3,1).
- bent 1x7: h0 A (0,0), h1-h3 P (1..3,0), h4 P (3.6,0.8),
  h5 P (4.2,1.6), h6 A (4.8,2.4).
- quarter-ellipse frame 3x5 (thin): h0 A (0,0), h1-h3 P (1..3,0),
  h4 A (4,0), h5 P (4,1), h6 A (4,2), with a curved rim from (0,0) to (4,2).
- crank (thin): h0 A (0,0), h1 P (1,0), h2 P (2,0), h3 P boss (3,0).

Connectors:
- cross block 2L: h0 A at (0,0,0), axis z; h1 P at (1,0,0), axis y.
- perpendicular connector 3L: h0 A (0,0,0) axis z; h1 P (1,0,0) axis y;
  h2 A (2,0,0) axis z.
- perpendicular connector 2L (black 6331716): h0 A (0,0,0) axis z;
  h1 A (1,0,0) axis y.
- axle connector 3L w/ centre hole: body x in [-1.5,1.5]; axle sockets
  b0 = [-1.5,-0.5] and b1 = [0.5,1.5]; h0 P at the origin, axis z.
- axle connector 2L: body x in [0,2]; sockets b0 = [0,1], b1 = [1,2].
- round connector 1L: h0 P at the origin, axis z, 1 long.
- half bush: h0 A, axis z, 0.5 long.
- pin hub w/ 2 axles: h0 P at the origin, axis x; axle stub s0 from
  (0,0,0.5) to (0,0,1.5); axle stub s1 from (0,0.5,0) to (0,1.5,0).

Gears (hole h0 A, axis local z):
- 8-tooth: pitch radius 0.5, 0.5 thick.
- 12-tooth double bevel: pitch radius 0.75, 1 thick.
- knob wheel: 1 thick. Two knob wheels mesh when their axes are
  perpendicular and intersect, and each wheel centre is about 1 module
  from the intersection.
- worm: axle bore along local x, [0,2]; it meshes with the 8-tooth gear
  when the axes are perpendicular and 1 module apart.

Special parts (the feature names are fixed; approximate the shape):
- ball-socket connector: h0 A (fits on a vertical axle), h1 A (side
  axle hole), "socket" (takes the ball of the ball-joint arm).
- ball-joint arm: h0 A, h1 P, "ball" about 2.5 modules from h0.
- curved panel 3x1: "bore" (axle bore along its hinged long edge,
  about 3 long) and h0 (a perpendicular axle hole on the underside).
- fairing #7 / #8: h0 A (pushed onto an axle end).
- bucket bracket: pins "pa" and "pb" (1 apart) and "mount" (for the
  loader bucket).
- loader bucket: about 7 wide x 4 deep x 2.5 high; "mount" at the rear.
- rim: h0 P along local z, radius 1.125, width 1.75, feature "seat".
- tyre: outer radius 1.9, width 1.75, feature "bore" (fits a rim seat).
- round 1x1 lens: "anti_stud" (fits a pin 1/2 "stud").

CONNECTION RULES

- A connection joins a feature of one part to a feature of another.
  Reference features as "<part id>.<feature>", for example "p012.h3".
- type: axle | pin | axle_pin | socket | stud | tyre | ball | clip |
  mesh | contact.
- motion: fixed | rotates | swivels. An axle in an A hole or socket is
  fixed. An axle or pin in a P hole rotates. A ball in a socket swivels.
- Give "at" (the world point of the joint) and "axis" (the world
  direction of the shaft or hinge axis). A shaft's hole centres must lie
  on its segment.
- Hole depth is limited. The parts threaded on one shaft segment may
  not add up to more than its length.
- A long axle passing through several parts needs one connection per
  part.
- Gear meshes use type "mesh", with a = the driving gear and b = the
  driven gear.
- Solid bodies must not overlap, except for a shaft inside its hole or
  socket.
- Every part must belong to one connected assembly. Nothing floats.

OUTPUT SCHEMA

{
  "title": "Technic Backhoe Loader 42197",
  "units": {"length": "module", "module_mm": 8},
  "axes": {"x": "right", "y": "forward", "z": "up"},
  "parts": [
    {
      "id": "p001",
      "element": "6115616",
      "color": "yellow",
      "subassembly": "chassis",
      "position": [-3, -3, 1.9],
      "x_axis": [0, 1, 0],
      "z_axis": [1, 0, 0]
    }
  ],
  "connections": [
    {
      "id": "c001",
      "a": "p040.s1",
      "b": "p001.h1",
      "type": "pin",
      "motion": "rotates",
      "at": [-3, -2, 1.9],
      "axis": [1, 0, 0]
    }
  ],
  "mechanisms": [
    {"function": "F1", "chain": ["p050", "p051", "p052"]}
  ]
}

The example shows syntax only. Return the complete model.
- subassembly is one of: chassis, drive_tower, cab, loader_gearbox,
  loader, backhoe, stabilizers, wheels.
- The parts array has exactly 104 entries, each with a unique id. The
  per-element counts and colors match the inventory exactly.
- mechanisms lists F1-F5. Each chain is the ordered part ids, from the
  input to the output.
- Do not use loops, references, placeholders, comments, or omitted
  sections.

Before returning JSON, check the following: 104 parts, with every
element count and color correct; unique IDs; every connection references
an existing feature; the assembly is fully connected; all four tyres rest
on z=0; the worm drive train is complete from knob to loader arms; the
ball joint, stabilizers and wheels can move; and no solid bodies overlap.