# KYC Update Request Payload Samples

## Endpoint
`POST /api/kyc/update-status`

---

## 1. Individual Account - US Citizen (Full Approval)

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "kycStatus": {
    "identityProofs": {
      "status": "Approved"
    },
    "addressProofs": {
      "status": "Approved"
    },
    "utilityBills": {
      "status": "Approved"
    },
    "ssn": {
      "verification": {
        "status": "Approved"
      }
    }
  }
}
```

---

## 2. Individual Account - Non-US Citizen (Full Approval)

```json
{
  "userId": "507f1f77bcf86cd799439012",
  "kycStatus": {
    "identityProofs": {
      "status": "Approved"
    },
    "addressProofs": {
      "status": "Approved"
    },
    "utilityBills": {
      "status": "Approved"
    },
    "passport": {
      "verification": {
        "status": "Approved"
      }
    }
  }
}
```

---

## 3. Individual Account - Partial Rejection Example

```json
{
  "userId": "507f1f77bcf86cd799439013",
  "kycStatus": {
    "identityProofs": {
      "status": "Approved"
    },
    "addressProofs": {
      "status": "Rejected",
      "reason": "Address proof document is not clear. Please upload a high-resolution scan."
    },
    "utilityBills": {
      "status": "Approved"
    },
    "ssn": {
      "verification": {
        "status": "Approved"
      }
    }
  }
}
```

---

## 4. Freelance Account - Full Approval (US Citizen)

```json
{
  "userId": "507f1f77bcf86cd799439014",
  "kycStatus": {
    "identityProofs": {
      "status": "Approved"
    },
    "addressProofs": {
      "status": "Approved"
    },
    "utilityBills": {
      "status": "Approved"
    },
    "ssn": {
      "verification": {
        "status": "Approved"
      }
    },
    "freelanceInfo": {
      "status": "Approved"
    },
    "physicalAddress": {
      "status": "Approved"
    },
    "intendedUse": {
      "status": "Approved"
    },
    "complianceDetails": {
      "status": "Approved"
    }
  }
}
```

---

## 5. Freelance Account - Full Approval (Non-US Citizen)

```json
{
  "userId": "507f1f77bcf86cd799439015",
  "kycStatus": {
    "identityProofs": {
      "status": "Approved"
    },
    "addressProofs": {
      "status": "Approved"
    },
    "utilityBills": {
      "status": "Approved"
    },
    "passport": {
      "verification": {
        "status": "Approved"
      }
    },
    "freelanceInfo": {
      "status": "Approved"
    },
    "physicalAddress": {
      "status": "Approved"
    },
    "intendedUse": {
      "status": "Approved"
    },
    "complianceDetails": {
      "status": "Approved"
    }
  }
}
```

---

## 6. Freelance Account - Partial Rejection Example

```json
{
  "userId": "507f1f77bcf86cd799439016",
  "kycStatus": {
    "identityProofs": {
      "status": "Approved"
    },
    "addressProofs": {
      "status": "Approved"
    },
    "utilityBills": {
      "status": "Approved"
    },
    "passport": {
      "verification": {
        "status": "Approved"
      }
    },
    "freelanceInfo": {
      "status": "Rejected",
      "reason": "Freelance profile links are not accessible. Please verify and resubmit."
    },
    "physicalAddress": {
      "status": "Approved"
    },
    "intendedUse": {
      "status": "Approved"
    },
    "complianceDetails": {
      "status": "Approved"
    }
  }
}
```

---

## 7. Business Account - Full Approval (US Citizen)

```json
{
  "userId": "507f1f77bcf86cd799439017",
  "kycStatus": {
    "identityProofs": {
      "status": "Approved"
    },
    "addressProofs": {
      "status": "Approved"
    },
    "utilityBills": {
      "status": "Approved"
    },
    "ssn": {
      "verification": {
        "status": "Approved"
      }
    },
    "businessInfo": {
      "registrationDocuments": {
        "status": "Approved"
      },
      "logo": {
        "status": "Approved"
      }
    },
    "physicalAddress": {
      "status": "Approved"
    },
    "intendedUse": {
      "supportingDocuments": {
        "status": "Approved"
      }
    },
    "complianceDetails": {
      "programDocumentForAML": {
        "status": "Approved"
      },
      "complianceOfficer": {
        "status": "Approved"
      },
      "beneficialOwnersList": [
        {
          "ssn": {
            "verification": {
              "status": "Approved"
            }
          }
        }
      ]
    }
  }
}
```

**Note:** If the beneficialOwner's email matches the registered user's email, SSN/Passport verification is automatically synced from the user's identity verification. Otherwise, provide explicit status in the payload.

---

## 8. Business Account - Full Approval (Non-US Citizen)

```json
{
  "userId": "507f1f77bcf86cd799439018",
  "kycStatus": {
    "identityProofs": {
      "status": "Approved"
    },
    "addressProofs": {
      "status": "Approved"
    },
    "utilityBills": {
      "status": "Approved"
    },
    "passport": {
      "verification": {
        "status": "Approved"
      }
    },
    "businessInfo": {
      "registrationDocuments": {
        "status": "Approved"
      },
      "logo": {
        "status": "Approved"
      }
    },
    "physicalAddress": {
      "status": "Approved"
    },
    "intendedUse": {
      "supportingDocuments": {
        "status": "Approved"
      }
    },
    "complianceDetails": {
      "programDocumentForAML": {
        "status": "Approved"
      },
      "complianceOfficer": {
        "status": "Approved"
      },
      "beneficialOwnersList": [
        {
          "passport": {
            "verification": {
              "status": "Approved"
            }
          }
        }
      ]
    }
  }
}
```

**Note:** If the beneficialOwner's email matches the registered user's email, Passport verification is automatically synced. Otherwise, provide explicit status.

---

## 9. Business Account - Partial Rejection Example

```json
{
  "userId": "507f1f77bcf86cd799439019",
  "kycStatus": {
    "identityProofs": {
      "status": "Approved"
    },
    "addressProofs": {
      "status": "Approved"
    },
    "utilityBills": {
      "status": "Approved"
    },
    "ssn": {
      "verification": {
        "status": "Approved"
      }
    },
    "businessInfo": {
      "registrationDocuments": {
        "status": "Rejected",
        "reason": "Business registration documents are incomplete. Missing EIN documentation."
      },
      "logo": {
        "status": "Approved"
      }
    },
    "physicalAddress": {
      "status": "Approved"
    },
    "intendedUse": {
      "supportingDocuments": {
        "status": "Approved"
      }
    },
    "complianceDetails": {
      "programDocumentForAML": {
        "status": "Rejected",
        "reason": "AML compliance program document does not meet regulatory requirements."
      },
      "complianceOfficer": {
        "status": "Approved"
      }
    }
  }
}
```

---

## 10. Business Account - Only AML Program Update

```json
{
  "userId": "507f1f77bcf86cd799439020",
  "kycStatus": {
    "complianceDetails": {
      "programDocumentForAML": {
        "status": "Approved"
      }
    }
  }
}
```

---

## 11. Business Account - Only Compliance Officer Update

```json
{
  "userId": "507f1f77bcf86cd799439021",
  "kycStatus": {
    "complianceDetails": {
      "complianceOfficer": {
        "status": "Rejected",
        "reason": "Compliance officer identification documents are expired."
      }
    }
  }
}
```

---

## 12. Individual Account - Only SSN Update

```json
{
  "userId": "507f1f77bcf86cd799439022",
  "kycStatus": {
    "ssn": {
      "verification": {
        "status": "Rejected",
        "reason": "SSN verification failed. Please verify the information provided."
      }
    }
  }
}
```

---

## 13. Individual Account - Only Passport Update

```json
{
  "userId": "507f1f77bcf86cd799439023",
  "kycStatus": {
   14. Business Account - Multiple Beneficial Owners with Mixed Citizenship

```json
{
  "userId": "507f1f77bcf86cd799439024",
  "kycStatus": {
    "identityProofs": {
      "status": "Approved"
    },
    "addressProofs": {
      "status": "Approved"
    },
    "utilityBills": {
      "status": "Approved"
    },
    "ssn": {
      "verification": {
        "status": "Approved"
      }
    },
    "businessInfo": {
      "registrationDocuments": {
        "status": "Approved"
      },
      "logo": {
        "status": "Approved"
      }
    },
    "physicalAddress": {
      "status": "Approved"
    },
    "intendedUse": {
      "supportingDocuments": {
        "status": "Approved"
      }
    },
    "complianceDetails": {
      "programDocumentForAML": {
        "status": "Approved"
      },
      "complianceOfficer": {
        "status": "Approved"
      },
      "beneficialOwnersList": [
        {
          "comment": "First owner - Registered user (US), SSN auto-synced from user's identity verification"
        },
        {
          "ssn": {
            "verification": {
              "status": "Approved"
            }
          },
          "comment": "Second owner - Different person (US), SSN verification provided"
        },
        {
          "passport": {
            "verification": {
              "status": "Approved"
            }
          },
   - **SSN/Passport Verification Logic:**
     - If `beneficialOwner.ownerEmail` matches `user.emailId` (case-insensitive), the SSN/Passport verification is automatically synced from the user's identity verification
     - For other beneficial owners, admin must provide explicit SSN/Passport verification status in the payload
   - Provide beneficial owner updates in `complianceDetails.beneficialOwnersList` array
   - Array index correspondence: `beneficialOwnersList[0]` = first owner, `[1]` = second owner, etc.
   - Each beneficial owner requires:
     - Persona status approval
     - SSN verification approval (if US citizen)
     - Passport verification approval (if non-US citizen)
   - Not directly updated through this endpoint
      ]
    }
  }
}
```

---

## 15. Business Account - Beneficial Owner SSN Rejection

```json
{
  "userId": "507f1f77bcf86cd799439025",
  "kycStatus": {
    "complianceDetails": {
      "beneficialOwnersList": [
        {
          "ssn": {
            "verification": {
              "status": "Rejected",
              "reason": "SSN verification failed. Information does not match government records."
            }
          }
        }
      ]
    }
  }
}
```

---

## 16. Business Account - Beneficial Owner Passport Rejection

```json
{
  "userId": "507f1f77bcf86cd799439026",
  "kycStatus": {
    "complianceDetails": {
      "beneficialOwnersList": [
        {
          "passport": {
            "verification": {
              "status": "Rejected",
              "reason": "Passport has expired. Please provide current passport documentation."
            }
          }
        },
        {
          "passport": {
            "verification": {
              "status": "Approved"
            }
          }
        }
      ]
    }
  }
}
```

**Note:** Array index matters - beneficialOwnersList[0] corresponds to the first owner in the database, [1] to the second, etc.

---

## 17. Business Account - Update Only Beneficial Owners

```json
{
  "userId": "507f1f77bcf86cd799439027",
  "kycStatus": {
    "complianceDetails": {
      "beneficialOwnersList": [
        {
          "ssn": {
            "verification": {
              "status": "Approved"
            }
          },
          "status": "Approved"
        },
        {
          "passport": {
            "verification": {
              "status": "Approved"
            }
          },
          "status": "Approved"
        }
      ]
    }
  }
}
```

---

##  "passport": {
      "verification": {
        "status": "Approved"
      }
    }
  }
}
```

---

## Notes

### Important Considerations:

1. **Citizenship-Based Validation:**
   - Use `ssn` field for users with `citizenshipCode === 'US'`
   - Use `passport` field for users with `citizenshipCode !== 'US'`

2. **Partial Updates:**
   - You can update individual fields without sending all fields
   - The service will only update the fields provided in the request
   - Other fields remain unchanged

3. **Status Values:**
   - Valid values: `"Approved"`, `"Rejected"`, `"Pending"`, `"Not Submitted"`
   - Only `"Approved"` and `"Rejected"` should be used for admin updates

4. **Rejection Reasons:**
   - Always provide a `reason` when status is `"Rejected"`
   - Reason field is optional (empty string) when status is `"Approved"`
   - Be specific and actionable in rejection reasons

5. **Account Type Requirements:**
   
   **Individual:**
   - Identity Proofs ✓
   - Address Proofs ✓
   - Utility Bills ✓
   - SSN (US) or Passport (Non-US) ✓

   **Freelance:**
   - All Individual requirements ✓
   - Freelance Info ✓
   - Physical Address ✓
   - Intended Use ✓:
     - AML Program ✓
     - Compliance Officer ✓
     - All Beneficial Owners:
       - Persona status approval ✓
       - SSN verification (US citizens) ✓
       - Passport verification (Non-US citizens
   - Compliance Details ✓

   **Business:**
   - All Individual requirements ✓
   - Business Info (Registration Documents + Logo) ✓
   - Physical Address ✓
   - Intended Use ✓
   - Compliance Details (AML Program + Compliance Officer + Beneficial Owners via Persona) ✓

6. **Email Notifications:**
   - Approval email sent when ALL required sections are approved
   - Rejection email sent when ANY section is rejected

7. **Beneficial Owners (Business Only):**
   - Beneficial owners KYC status is managed through Persona
   - Not directly updated through this endpoint
   - Checked automatically by the service for overall compliance status

---

## cURL Examples

### Individual Account Approval (US Citizen)
```bash
curl -X POST http://localhost:3000/api/kyc/update-status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "kycStatus": {
      "identityProofs": {"status": "Approved"},
      "addressProofs": {"status": "Approved"},
      "utilityBills": {"status": "Approved"},
      "ssn": {"verification": {"status": "Approved"}}
    }
  }'
```

### Freelance Account Approval (Non-US Citizen)
```bash
curl -X POST http://localhost:3000/api/kyc/update-status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "userId": "507f1f77bcf86cd799439015",
    "kycStatus": {
      "identityProofs": {"status": "Approved"},
      "addressProofs": {"status": "Approved"},
      "utilityBills": {"status": "Approved"},
      "passport": {"verification": {"status": "Approved"}},
      "freelanceInfo": {"status": "Approved"},
      "physicalAddress": {"status": "Approved"},
      "intendedUse": {"status": "Approved"},
      "complianceDetails": {"status": "Approved"}
    }
  }'
```

### Business Account Approval (US Citizen)
```bash
curl -X POST http://localhost:3000/api/kyc/update-status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "userId": "507f1f77bcf86cd799439017",
    "kycStatus": {
      "identityProofs": {"status": "Approved"},,
        "beneficialOwnersList": [
          {"ssn": {"verification": {"status": "Approved"}}}
        ]
      "addressProofs": {"status": "Approved"},
      "utilityBills": {"status": "Approved"},
      "ssn": {"verification": {"status": "Approved"}},
      "businessInfo": {
        "registrationDocuments": {"status": "Approved"},
        "logo": {"status": "Approved"}
      },
      "physicalAddress": {"status": "Approved"},
      "intendedUse": {
        "supportingDocuments": {"status": "Approved"}
      },
      "complianceDetails": {
        "programDocumentForAML": {"status": "Approved"},
        "complianceOfficer": {"status": "Approved"}
      }
    }
  }'
```

---

## Postman Collection

Import this JSON into Postman for quick testing:

```json
{
  "info": {
    "name": "KYC Status Update API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Individual - Full Approval (US)",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"userId\": \"507f1f77bcf86cd799439011\",\n  \"kycStatus\": {\n    \"identityProofs\": {\"status\": \"Approved\"},\n    \"addressProofs\": {\"status\": \"Approved\"},\n    \"utilityBills\": {\"status\": \"Approved\"},\n    \"ssn\": {\"verification\": {\"status\": \"Approved\"}}\n  }\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/kyc/update-status",
          "host": ["{{baseUrl}}"],
          "path": ["api", "kyc", "update-status"]
        }
      }
    },
    {
      "name": "Freelance - Full Approval (Non-US)",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"userId\": \"507f1f77bcf86cd799439015\",\n  \"kycStatus\": {\n    \"identityProofs\": {\"status\": \"Approved\"},\n    \"addressProofs\": {\"status\": \"Approved\"},\n    \"utilityBills\": {\"status\": \"Approved\"},\n    \"passport\": {\"verification\": {\"status\": \"Approved\"}},\n    \"freelanceInfo\": {\"status\": \"Approved\"},\n    \"physicalAddress\": {\"status\": \"Approved\"},\n    \"intendedUse\": {\"status\": \"Approved\"},\n    \"complianceDetails\": {\"status\": \"Approved\"}\n  }\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/kyc/update-status",
          "host": ["{{baseUrl}}"],,\n      \"beneficialOwnersList\": [\n        {\"ssn\": {\"verification\": {\"status\": \"Approved\"}}}\n      ]
          "path": ["api", "kyc", "update-status"]
        }
      }
    },
    {
      "name": "Business - Full Approval (US)",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"userId\": \"507f1f77bcf86cd799439017\",\n  \"kycStatus\": {\n    \"identityProofs\": {\"status\": \"Approved\"},\n    \"addressProofs\": {\"status\": \"Approved\"},\n    \"utilityBills\": {\"status\": \"Approved\"},\n    \"ssn\": {\"verification\": {\"status\": \"Approved\"}},\n    \"businessInfo\": {\n      \"registrationDocuments\": {\"status\": \"Approved\"},\n      \"logo\": {\"status\": \"Approved\"}\n    },\n    \"physicalAddress\": {\"status\": \"Approved\"},\n    \"intendedUse\": {\n      \"supportingDocuments\": {\"status\": \"Approved\"}\n    },\n    \"complianceDetails\": {\n      \"programDocumentForAML\": {\"status\": \"Approved\"},\n      \"complianceOfficer\": {\"status\": \"Approved\"}\n    }\n  }\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/kyc/update-status",
          "host": ["{{baseUrl}}"],
          "path": ["api", "kyc", "update-status"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    }
  ]
}
```
