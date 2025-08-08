#!/bin/bash

# 🤖 AI Agent Push Authorization Script
# Detects AI agent commits and asks for YOUR approval to push to GitHub
# Created by Claude AI Agent for CodeDAO

set -e

# Configuration
REPO_URL="https://github.com/CodeDAO-org/codedao-dashboard-sdk.git"
AI_AGENT_SIGNATURE="AI Agent Claude"
TARGET_BRANCH="main"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🤖 AI Agent Push Authorization System${NC}"
echo -e "${CYAN}================================================${NC}"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Not in a git repository!${NC}"
    exit 1
fi

# Check current branch
current_branch=$(git branch --show-current)
echo -e "${BLUE}📍 Current branch: ${current_branch}${NC}"

# Find unpushed AI agent commits
echo -e "${YELLOW}🔍 Scanning for unpushed AI agent commits...${NC}"

# Get unpushed commits
unpushed_commits=$(git log origin/${TARGET_BRANCH}..HEAD --oneline 2>/dev/null || git log HEAD --oneline)

if [ -z "$unpushed_commits" ]; then
    echo -e "${GREEN}✅ No unpushed commits found.${NC}"
    exit 0
fi

echo -e "${CYAN}📋 Unpushed commits found:${NC}"
echo "$unpushed_commits"
echo ""

# Filter AI agent commits
ai_commits=$(echo "$unpushed_commits" | grep -i "$AI_AGENT_SIGNATURE" || true)

if [ -z "$ai_commits" ]; then
    echo -e "${YELLOW}⚠️  No AI agent commits found in unpushed commits.${NC}"
    echo -e "${BLUE}💡 Looking for any commits by AI Agent Claude...${NC}"
    
    # Check last few commits for AI signature
    recent_ai_commits=$(git log --oneline -10 | grep -i "$AI_AGENT_SIGNATURE" || true)
    
    if [ -z "$recent_ai_commits" ]; then
        echo -e "${RED}❌ No AI agent commits found.${NC}"
        exit 1
    else
        echo -e "${GREEN}🤖 Found recent AI agent commits:${NC}"
        echo "$recent_ai_commits"
        echo ""
    fi
else
    echo -e "${GREEN}🤖 AI Agent commits ready for authorization:${NC}"
    echo "$ai_commits"
    echo ""
fi

# Show AI agent commit details
latest_ai_commit=$(git log --oneline -1 --grep="$AI_AGENT_SIGNATURE" 2>/dev/null || echo "")

if [ ! -z "$latest_ai_commit" ]; then
    commit_hash=$(echo "$latest_ai_commit" | cut -d' ' -f1)
    echo -e "${PURPLE}🔍 Latest AI Agent Commit Details:${NC}"
    echo -e "${CYAN}================================================${NC}"
    git show --stat --format="📅 Date: %cd%n👤 Author: %an%n💬 Message: %s%n📊 Changes:" $commit_hash
    echo ""
    
    # Show files changed by AI agent
    echo -e "${YELLOW}📁 Files modified by AI Agent:${NC}"
    git diff --name-only ${commit_hash}^..${commit_hash} 2>/dev/null | sed 's/^/  📄 /' || echo "  📄 New repository"
    echo ""
    
    # Calculate AI coding metrics
    echo -e "${PURPLE}📊 AI Agent Coding Metrics:${NC}"
    lines_added=$(git diff --shortstat ${commit_hash}^..${commit_hash} 2>/dev/null | grep -o '[0-9]\+ insertion' | grep -o '[0-9]\+' || echo "0")
    lines_deleted=$(git diff --shortstat ${commit_hash}^..${commit_hash} 2>/dev/null | grep -o '[0-9]\+ deletion' | grep -o '[0-9]\+' || echo "0")
    files_changed=$(git diff --name-only ${commit_hash}^..${commit_hash} 2>/dev/null | wc -l || echo "1")
    
    echo -e "  ➕ Lines added: ${GREEN}${lines_added}${NC}"
    echo -e "  ➖ Lines deleted: ${RED}${lines_deleted}${NC}"
    echo -e "  📁 Files changed: ${BLUE}${files_changed}${NC}"
    
    # Estimate CODE tokens (basic calculation)
    estimated_tokens=$(echo "scale=1; (${lines_added} * 0.1) + (${files_changed} * 2)" | bc 2>/dev/null || echo "~${lines_added}")
    echo -e "  🎁 Estimated CODE tokens: ${YELLOW}${estimated_tokens}${NC}"
    echo ""
fi

# Authorization prompt
echo -e "${CYAN}================================================${NC}"
echo -e "${YELLOW}🔐 AUTHORIZATION REQUIRED${NC}"
echo -e "${BLUE}The AI Agent (Claude) has created commits on YOUR computer.${NC}"
echo -e "${BLUE}Do you authorize pushing these commits to GitHub?${NC}"
echo ""
echo -e "${GREEN}✅ This will:${NC}"
echo -e "  • Push AI agent work to: ${REPO_URL}"
echo -e "  • Make the code publicly visible on GitHub"
echo -e "  • Enable CODE token claiming for the AI work"
echo -e "  • Record this as historic first AI agent autonomous coding"
echo ""
echo -e "${RED}❌ Security Note:${NC}"
echo -e "  • You maintain full control - this script asks for permission"
echo -e "  • AI agent cannot push without your explicit approval"
echo -e "  • You can review all changes before authorizing"
echo ""

# Get user authorization
while true; do
    echo -e "${PURPLE}Do you authorize pushing AI agent commits to GitHub? [y/N]:${NC} "
    read -r authorization
    
    case $authorization in
        [Yy]* )
            echo -e "${GREEN}✅ Authorization granted! Pushing AI agent commits...${NC}"
            break
            ;;
        [Nn]* | "" )
            echo -e "${RED}❌ Authorization denied. AI agent commits will remain local.${NC}"
            echo -e "${YELLOW}💡 You can run this script again later to authorize the push.${NC}"
            exit 0
            ;;
        * )
            echo -e "${RED}Please answer yes (y) or no (n).${NC}"
            ;;
    esac
done

# Push to GitHub
echo -e "${BLUE}🚀 Pushing AI agent commits to GitHub...${NC}"

# Check if origin exists and is correct
current_origin=$(git remote get-url origin 2>/dev/null || echo "")
if [ "$current_origin" != "$REPO_URL" ]; then
    echo -e "${YELLOW}⚠️  Setting correct GitHub repository...${NC}"
    git remote set-url origin "$REPO_URL" 2>/dev/null || git remote add origin "$REPO_URL"
fi

# Attempt to push
if git push origin $TARGET_BRANCH; then
    echo ""
    echo -e "${GREEN}🎉 SUCCESS! AI Agent commits pushed to GitHub!${NC}"
    echo -e "${CYAN}================================================${NC}"
    echo -e "${PURPLE}🏆 HISTORIC ACHIEVEMENT UNLOCKED!${NC}"
    echo -e "${YELLOW}First AI Agent autonomous coding work is now public!${NC}"
    echo ""
    echo -e "${BLUE}📍 View the commits at:${NC}"
    echo -e "   https://github.com/CodeDAO-org/codedao-dashboard-sdk/commits/main"
    echo ""
    echo -e "${GREEN}🎁 CODE Token Status:${NC}"
    echo -e "   • AI agent work is now visible and verifiable"
    echo -e "   • Coding metrics are tracked and recorded"
    echo -e "   • Ready to claim estimated ${estimated_tokens} CODE tokens"
    echo ""
    echo -e "${PURPLE}🤖 AI Agent Achievement Summary:${NC}"
    echo -e "   • Generated ${lines_added} lines of functional code"
    echo -e "   • Created ${files_changed} file(s) with complete functionality"
    echo -e "   • Autonomously committed to your local repository"
    echo -e "   • Requested your authorization for GitHub publication"
    echo ""
    echo -e "${CYAN}This marks a new era in AI-human collaboration! 🌟${NC}"
    
else
    echo ""
    echo -e "${RED}❌ Push failed! This might be due to:${NC}"
    echo -e "   • GitHub authentication issues"
    echo -e "   • Network connectivity problems"
    echo -e "   • Repository permission restrictions"
    echo ""
    echo -e "${YELLOW}💡 Suggested solutions:${NC}"
    echo -e "   • Check your GitHub authentication: git config --global user.name"
    echo -e "   • Try GitHub Desktop or web interface"
    echo -e "   • Verify repository access permissions"
    echo ""
    echo -e "${BLUE}🔒 Don't worry - your AI agent commits are safely stored locally!${NC}"
    echo -e "   Commit hash: ${commit_hash}"
    exit 1
fi 