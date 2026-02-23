# DSA Problem Bulk Upload Guide

## Overview
This guide explains how to use the bulk upload feature to add multiple DSA problems at once, significantly faster than adding them one by one.

## How to Access Bulk Upload

1. Go to the **Admin Dashboard** → **Add DSA Problem** page
2. Click the **"Bulk Upload"** button in the top-right corner
3. A modal will open with instructions and a JSON input area

## JSON Format

All DSA problems must be provided as a JSON array with the following structure:

```json
[
  {
    "title": "Problem Title",
    "description": "Detailed problem statement",
    "difficulty": "Easy|Medium|Hard",
    "tags": ["Tag1", "Tag2"],
    "constraints": "1 <= n <= 10^5",
    "sampleInput": "Example input",
    "sampleOutput": "Example output",
    "functionSignature": "vector<int> functionName(vector<int>& nums)",
    "boilerplateCode": "int main() { ... Solution sol; ... return 0; }",
    "acceptanceCriteria": "EXACT_MATCH|SET_MATCH|SORTED_MATCH|CUSTOM",
    "visibleTestCases": [
      {
        "input": "test input",
        "expectedOutput": ["output1", "output2"],
        "explanation": "why this output is correct"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "test input",
        "expectedOutput": ["expected output"],
        "explanation": ""
      }
    ]
  }
]
```

## Required Fields

- **title** - Problem name (must be unique)
- **description** - Full problem statement
- **difficulty** - "Easy", "Medium", or "Hard"
- **functionSignature** - The function users will implement
- **boilerplateCode** - Complete C++ code with main() function
- **visibleTestCases** - Array of test cases shown during "Run"
- **hiddenTestCases** - Array of test cases checked during "Submit"

## Optional Fields

- **tags** - Array of topic tags (e.g., ["Array", "Sorting"])
- **constraints** - Problem constraints
- **sampleInput** - Example input shown to users
- **sampleOutput** - Example output shown to users
- **acceptanceCriteria** - How to compare outputs (default: "EXACT_MATCH")

## Test Case Format

Each test case in visible and hidden arrays should have:
```json
{
  "input": "Input as string",
  "expectedOutput": ["possible_output_1", "possible_output_2"],
  "explanation": "Optional explanation"
}
```

**Note:** `expectedOutput` is always an array to support multiple valid answers.

## Example Problem

```json
[
  {
    "title": "Two Sum",
    "description": "Given an array of integers, find two numbers that add up to a target.",
    "difficulty": "Easy",
    "tags": ["Array", "Hash Table"],
    "constraints": "2 <= nums.length <= 10^4",
    "sampleInput": "[2, 7, 11, 15], target = 9",
    "sampleOutput": "[0, 1]",
    "functionSignature": "vector<int> twoSum(vector<int>& nums, int target)",
    "boilerplateCode": "int main() {\n  vector<int> nums = {2, 7, 11, 15};\n  int target = 9;\n  Solution sol;\n  vector<int> result = sol.twoSum(nums, target);\n  cout << result[0] << \",\" << result[1];\n  return 0;\n}",
    "acceptanceCriteria": "EXACT_MATCH",
    "visibleTestCases": [
      {
        "input": "[2, 7, 11, 15], target = 9",
        "expectedOutput": ["[0, 1]"],
        "explanation": "nums[0] + nums[1] == 9"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[3, 3], target = 6",
        "expectedOutput": ["[0, 1]"],
        "explanation": ""
      }
    ]
  }
]
```

## Steps to Use

1. **Prepare JSON file** with problem data using the format above
2. **Open Bulk Upload Modal** by clicking the "Bulk Upload" button
3. **Copy & Paste** your JSON into the textarea, OR click "Use Template" to see an example
4. **Validate** - The modal shows a green checkmark when JSON is valid
5. **Upload** - Click "Upload DSA Problems" button
6. **Confirm** - Success message shows how many problems were uploaded

## Important Notes

- ✅ **LeetCode Style**: Only users write the function body; the boilerplate with main() is provided
- ❌ **Duplicate Titles**: Each problem title must be unique
- 📝 **Tags**: Convert to lowercase automatically
- 🧪 **Test Cases**: At least one visible and one hidden test case required
- 💾 **Backup**: Export problems before bulk upload in case of issues

## Validation Rules

The system validates:
- All required fields are present
- Difficulty is "Easy", "Medium", or "Hard"
- visibleTestCases and hiddenTestCases are non-empty arrays
- Each test case has input and expectedOutput
- JSON is properly formatted

## Troubleshooting

| Error | Solution |
|-------|----------|
| "Invalid JSON format" | Check JSON syntax using an online JSON validator |
| "Missing required field" | Ensure all required fields are present in every problem |
| "Duplicate title" | Make each problem title unique |
| "Invalid difficulty" | Use only "Easy", "Medium", or "Hard" |
| "Missing test cases" | Add at least 1 visible and 1 hidden test case |

## Backend API

**Endpoint:** `POST /api/admin/dsa/bulk`

**Request Body:**
```json
{
  "problems": [
    { /* problem object */ }
  ]
}
```

**Success Response (201):**
```json
{
  "message": "Successfully created X DSA problems!",
  "count": X,
  "problems": [/* created problems */]
}
```

**Error Response:**
```json
{
  "message": "Validation failed for some problems",
  "errors": [
    {
      "index": 0,
      "title": "Problem Title",
      "error": "Error description"
    }
  ]
}
```
