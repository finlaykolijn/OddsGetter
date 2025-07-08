# Season-Based Team Management

## Overview

Instead of deleting relegated teams from the database, this approach uses **season filtering** to show only relevant teams for each season while preserving historical data.

## Benefits

✅ **Preserves Historical Data** - All past seasons' odds and matches remain accessible  
✅ **Better User Experience** - Users can compare seasons or look back at historical trends  
✅ **No Data Loss Risk** - No accidental deletion of valuable historical data  
✅ **Easy Season Switching** - Simple dropdown to switch between seasons  
✅ **Future-Proof** - Easy to add new seasons without losing old data  

## How It Works

### 1. **Season Selector**
- Dropdown in the header allows switching between seasons
- Current season (2025/26) shows only current Premier League teams
- Past seasons show all teams that played in that season

### 2. **API Filtering**
- `/api/teams?season=2025-26` - Returns only current teams
- `/api/teams?season=2024-25` - Returns all teams from 2024/25 season
- `/api/matches?season=2025-26` - Returns only current season matches
- `/api/matches?season=2024-25` - Returns all matches from 2024/25 season

### 3. **Team Configuration**
- `current_premier_league_teams.json` defines teams for current season
- Only affects 2025/26 season filtering
- Past seasons show all teams that existed in that season

## Current Season (2025/26)

**Current Teams:**
- Arsenal, Aston Villa, Bournemouth, Brentford, Brighton and Hove Albion
- Burnley, Chelsea, Crystal Palace, Everton, Fulham
- Leeds United, Liverpool, Manchester City, Manchester United
- Newcastle United, Nottingham Forest, Sunderland, Tottenham Hotspur
- West Ham United, Wolverhampton Wanderers

**Relegated from 2024/25:**
- Leicester City, Southampton, Ipswich Town

## Available Seasons

1. **2025/26 (Current)** - Only current Premier League teams
2. **2024/25** - All teams from last season (including relegated teams)
3. **2023/24** - All teams from 2023/24 season

## Usage

### For Users:
1. Use the season dropdown in the header to switch seasons
2. Current season (2025/26) shows only current teams
3. Past seasons show all teams that played in that season
4. All historical odds and matches are preserved

### For Developers:
1. Update `current_premier_league_teams.json` when teams are promoted/relegated
2. Add new seasons to the `/api/seasons` endpoint
3. Historical data remains accessible for analysis

## Files Modified

### New Files:
- `src/components/SeasonSelector.tsx` - Season dropdown component
- `SEASON_BASED_APPROACH.md` - This documentation

### Modified Files:
- `src/App.tsx` - Added season selection and filtering
- `src/App.css` - Added styles for season selector
- `server.ts` - Added season-based API filtering
- `server.js` - Added season-based API filtering
- `current_premier_league_teams.json` - Updated for 2025/26 season

## API Endpoints

### GET `/api/seasons`
Returns available seasons:
```json
[
  { "id": "2025-26", "name": "Premier League", "year": "2025/26", "isCurrent": true },
  { "id": "2024-25", "name": "Premier League", "year": "2024/25", "isCurrent": false },
  { "id": "2023-24", "name": "Premier League", "year": "2023/24", "isCurrent": false }
]
```

### GET `/api/teams?season=2025-26`
Returns only current Premier League teams (filtered)

### GET `/api/teams?season=2024-25`
Returns all teams from 2024/25 season (unfiltered)

### GET `/api/matches?season=2025-26`
Returns only current season matches (filtered)

### GET `/api/matches?season=2024-25`
Returns all matches from 2024/25 season (unfiltered)

## Maintenance

### Adding a New Season:
1. Update `current_premier_league_teams.json` with new current teams
2. Add new season to `/api/seasons` endpoint
3. Historical data remains accessible

### Example: End of 2025/26 Season
1. Update `current_premier_league_teams.json`:
   - Remove relegated teams from `current_teams`
   - Add promoted teams to `current_teams`
   - Update `relegated_teams` list
2. Add 2026/27 season to `/api/seasons`
3. All 2025/26 data remains accessible in the 2025/26 season view

## Advantages Over Data Deletion

| Aspect | Season Filtering | Data Deletion |
|--------|------------------|---------------|
| Historical Data | ✅ Preserved | ❌ Lost Forever |
| User Experience | ✅ Better (can compare seasons) | ❌ Limited |
| Data Analysis | ✅ Full historical trends | ❌ Limited analysis |
| Risk | ✅ Safe (no data loss) | ❌ Risky (accidental deletion) |
| Maintenance | ✅ Easy (just update config) | ❌ Complex (need cleanup scripts) |

This approach is much better than deleting data because it preserves valuable historical information while still providing a clean current-season experience. 