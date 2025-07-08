# Premier League Team Cleanup Guide

## Overview

This guide explains how to remove relegated teams from your OddsGetter application and maintain only current Premier League teams.

## Problem

Your application currently includes teams that were relegated from the Premier League last season:
- **Burnley** (relegated 2023/24)
- **Sunderland** (relegated 2016/17, but appears in your data)
- **Leeds United** (relegated 2022/23)

## Solution

I've implemented a filtering system that:

1. **Maintains a configuration file** (`current_premier_league_teams.json`) with current Premier League teams
2. **Filters API responses** to only include current teams
3. **Provides cleanup scripts** to remove relegated teams from the database

## Files Created/Modified

### New Files:
- `current_premier_league_teams.json` - Configuration file with current teams
- `cleanup_relegated_teams.js` - JavaScript cleanup script
- `cleanup_relegated_teams.ts` - TypeScript cleanup script
- `TEAM_CLEANUP_README.md` - This documentation

### Modified Files:
- `server.ts` - Added team filtering to API endpoints
- `server.js` - Added team filtering to API endpoints

## Current Premier League Teams (2024/25 Season)

The configuration includes these 20 teams:
- Arsenal
- Aston Villa
- Bournemouth
- Brentford
- Brighton and Hove Albion
- Chelsea
- Crystal Palace
- Everton
- Fulham
- Ipswich Town (promoted)
- Leicester City (promoted)
- Liverpool
- Manchester City
- Manchester United
- Newcastle United
- Nottingham Forest
- Southampton (promoted)
- Tottenham Hotspur
- West Ham United
- Wolverhampton Wanderers

## How to Use

### 1. Update Team Configuration

Edit `current_premier_league_teams.json` to reflect the current Premier League season:

```json
{
  "current_teams": [
    "Arsenal",
    "Aston Villa",
    // ... add all current teams
  ],
  "relegated_teams": [
    "Burnley",
    "Luton Town", 
    "Sheffield United"
  ],
  "season": "2024/25",
  "last_updated": "2024-12-19"
}
```

### 2. Clean Up Database (Optional)

Run the cleanup script to remove relegated teams from your database:

```bash
# JavaScript version
node cleanup_relegated_teams.js

# TypeScript version
npx ts-node cleanup_relegated_teams.ts
```

The script will:
- Show you which games involve relegated teams
- Ask for confirmation before deletion
- Remove match odds and games for relegated teams

### 3. Restart Your Server

The API endpoints now automatically filter out relegated teams:

- `/api/teams` - Only returns current Premier League teams
- `/api/matches` - Only returns matches between current teams
- `/api/odds/:homeTeam/:awayTeam` - Validates both teams are current

## API Changes

### Before:
```json
{
  "team": "Burnley"
}
```

### After:
```json
{
  "team": "Arsenal"
}
```

The API will no longer return relegated teams like Burnley, Sunderland, or Leeds United.

## Maintenance

### For Future Seasons:

1. **Update the configuration file** when teams are promoted/relegated
2. **Run the cleanup script** to remove relegated teams from the database
3. **The API will automatically filter** based on the configuration

### Example: End of 2024/25 Season

When the 2024/25 season ends and teams are relegated:

1. Update `current_premier_league_teams.json`:
   - Remove relegated teams from `current_teams`
   - Add relegated teams to `relegated_teams`
   - Add promoted teams to `current_teams`

2. Run the cleanup script to remove relegated teams from the database

3. The API will automatically start filtering based on the new configuration

## Benefits

- **Clean data**: No more relegated teams in your application
- **Automatic filtering**: API responses are automatically filtered
- **Easy maintenance**: Simple configuration file to update
- **Safe cleanup**: Scripts with confirmation before deletion
- **Future-proof**: Easy to update for new seasons

## Testing

After implementing these changes:

1. Start your server
2. Visit your frontend application
3. Check that only current Premier League teams appear in dropdowns
4. Verify that no relegated teams are shown in team lists or match results

The filtering happens at the API level, so your frontend will automatically show only current teams without any frontend code changes. 