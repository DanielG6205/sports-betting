/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/sports_betting.json`.
 */
export type SportsBetting = {
  "address": "Count3AcZucFDPSFBAeHkQ6AvttieKUkyJ8HiQGhQwe",
  "metadata": {
    "name": "sportsBetting",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "claimRewards",
      "discriminator": [
        4,
        144,
        132,
        71,
        116,
        23,
        151,
        80
      ],
      "accounts": [
        {
          "name": "bettor",
          "writable": true,
          "signer": true
        },
        {
          "name": "sportsBetting",
          "writable": true
        },
        {
          "name": "potAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "sportsBetting"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "endGame",
      "discriminator": [
        224,
        135,
        245,
        99,
        67,
        175,
        121,
        252
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "sportsBetting",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "winningTeam",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initializeConfig",
      "discriminator": [
        208,
        127,
        21,
        1,
        194,
        190,
        196,
        70
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "sportsBetting",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  112,
                  111,
                  114,
                  116,
                  115,
                  95,
                  98,
                  101,
                  116,
                  116,
                  105,
                  110,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "potAccount",
          "docs": [
            "It is initialized by this instruction and only accessed via program-derived addresses."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "sportsBetting"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "teamA",
          "type": "string"
        },
        {
          "name": "teamB",
          "type": "string"
        },
        {
          "name": "start",
          "type": "u64"
        },
        {
          "name": "end",
          "type": "u64"
        }
      ]
    },
    {
      "name": "placeBet",
      "discriminator": [
        222,
        62,
        67,
        220,
        63,
        166,
        126,
        33
      ],
      "accounts": [
        {
          "name": "bettor",
          "writable": true,
          "signer": true
        },
        {
          "name": "sportsBetting",
          "writable": true
        },
        {
          "name": "potAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "sportsBetting"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "team",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "sportsBetting",
      "discriminator": [
        165,
        5,
        221,
        10,
        131,
        129,
        10,
        245
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "bettingClosed",
      "msg": "Betting is closed"
    },
    {
      "code": 6001,
      "name": "invalidTeam",
      "msg": "Invalid team ID"
    },
    {
      "code": 6002,
      "name": "maxBettorsReached",
      "msg": "Max bettors reached"
    },
    {
      "code": 6003,
      "name": "insufficientPot",
      "msg": "Insufficient pot"
    },
    {
      "code": 6004,
      "name": "gameSettled",
      "msg": "Game already settled"
    },
    {
      "code": 6005,
      "name": "nothingToClaim",
      "msg": "You have nothing to claim"
    },
    {
      "code": 6006,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6007,
      "name": "gameNotEnded",
      "msg": "Game has not ended yet"
    },
    {
      "code": 6008,
      "name": "overflow",
      "msg": "Overflow error"
    }
  ],
  "types": [
    {
      "name": "bettor",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "team",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "sportsBetting",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "potBump",
            "type": "u8"
          },
          {
            "name": "teamAName",
            "type": "string"
          },
          {
            "name": "teamBName",
            "type": "string"
          },
          {
            "name": "winners",
            "type": {
              "vec": {
                "defined": {
                  "name": "winners"
                }
              }
            }
          },
          {
            "name": "bettors",
            "type": {
              "vec": {
                "defined": {
                  "name": "bettor"
                }
              }
            }
          },
          {
            "name": "gameStart",
            "type": "u64"
          },
          {
            "name": "gameEnd",
            "type": "u64"
          },
          {
            "name": "status",
            "type": "u8"
          },
          {
            "name": "winningTeam",
            "type": {
              "option": "u8"
            }
          },
          {
            "name": "pot",
            "type": "u64"
          },
          {
            "name": "admin",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "winners",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
