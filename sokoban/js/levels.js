/**
 * Sokoban Level Data
 * 
 * Legend:
 *   # - Wall
 *   (space) - Floor
 *   . - Target/Goal
 *   $ - Box
 *   @ - Player
 *   * - Box on target
 *   + - Player on target
 */

const LEVELS = [
    // Level 1 - Tutorial
    [
        "  ####  ",
        "###  ###",
        "#   $  #",
        "#  .@  #",
        "#   $. #",
        "### ####",
        "  ###   "
    ],
    
    // Level 2 - Simple push
    [
        "#####   ",
        "#   #   ",
        "# $ # ##",
        "# . # .#",
        "#  $@ ##",
        "#######"
    ],
    
    // Level 3 - Corner challenge
    [
        "  ######",
        "###    #",
        "# $ $  #",
        "# .#.  #",
        "#  # @##",
        "####  # ",
        "   #### "
    ],
    
    // Level 4 - Two boxes
    [
        "########",
        "#  #   #",
        "# $$ @ #",
        "#  ## ##",
        "## #. # ",
        " # .. # ",
        " #    # ",
        " ###### "
    ],
    
    // Level 5 - Maze
    [
        "  ##### ",
        "  #   # ",
        "### #.##",
        "#  $  @#",
        "# $ #  #",
        "##.## ##",
        " #    # ",
        " ###### "
    ],
    
    // Level 6 - Three targets
    [
        " ###### ",
        "##    ##",
        "#  ##  #",
        "# $..$ #",
        "#  ..  #",
        "# $  $ #",
        "## @@ ##",
        " ###### "
    ].map(row => row.replace('@@', '@ ')), // Fix double player
    
    // Level 7 - Tight spaces
    [
        "########",
        "#      #",
        "# $#$# #",
        "# .#.#@#",
        "# $#$# #",
        "# .#.# #",
        "#      #",
        "########"
    ],
    
    // Level 8 - Strategic
    [
        "  ####  ",
        "  #  #  ",
        " ## $###",
        "##  $  #",
        "# @$ $ #",
        "#...   #",
        "########"
    ],
    
    // Level 9 - Complex
    [
        " #######",
        " #  . .#",
        "##$### #",
        "#   $  #",
        "#  $ ###",
        "## #.#  ",
        " # @ #  ",
        " #####  "
    ],
    
    // Level 10 - Master
    [
        "  #######",
        "###  #  #",
        "# $  #  #",
        "#  $@$ ##",
        "### $#.# ",
        "  #  ..# ",
        "  # #..# ",
        "  #    # ",
        "  ###### "
    ]
];

// Validate and normalize levels
const levels = LEVELS.map((level, index) => {
    // Ensure all rows have the same length
    const maxWidth = Math.max(...level.map(row => row.length));
    return level.map(row => row.padEnd(maxWidth, ' '));
});
