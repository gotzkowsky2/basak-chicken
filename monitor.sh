#!/bin/bash

# 서버 모니터링 스크립트
APP_NAME="basak-chicken-app"
LOG_FILE="/root/basak-chicken-app/logs/monitor.log"
MAX_RESTARTS=5
RESTART_COUNT_FILE="/root/basak-chicken-app/logs/restart_count.txt"

# 로그 함수
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# 재시작 횟수 확인
get_restart_count() {
    if [ -f "$RESTART_COUNT_FILE" ]; then
        cat "$RESTART_COUNT_FILE"
    else
        echo "0"
    fi
}

# 재시작 횟수 증가
increment_restart_count() {
    local count=$(get_restart_count)
    echo $((count + 1)) > "$RESTART_COUNT_FILE"
}

# 재시작 횟수 초기화
reset_restart_count() {
    echo "0" > "$RESTART_COUNT_FILE"
}

# 서버 상태 확인
check_server() {
    local response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/employee/me)
    if [ "$response" = "200" ]; then
        return 0
    else
        return 1
    fi
}

# PM2 프로세스 상태 확인
check_pm2() {
    local status=$(pm2 jlist | jq -r ".[] | select(.name == \"$APP_NAME\") | .pm2_env.status")
    if [ "$status" = "online" ]; then
        return 0
    else
        return 1
    fi
}

# 메인 모니터링 로직
main() {
    log "서버 모니터링 시작"
    
    # 서버 상태 확인
    if ! check_server; then
        log "서버 응답 없음 - PM2 상태 확인 중..."
        
        if ! check_pm2; then
            local restart_count=$(get_restart_count)
            log "PM2 프로세스 중단됨 (재시작 횟수: $restart_count)"
            
            if [ "$restart_count" -lt "$MAX_RESTARTS" ]; then
                log "서버 재시작 시도..."
                pm2 restart "$APP_NAME"
                increment_restart_count
                log "서버 재시작 완료"
                
                # 재시작 후 30초 대기
                sleep 30
                
                if check_server; then
                    log "서버 정상 복구됨"
                    reset_restart_count
                else
                    log "서버 복구 실패"
                fi
            else
                log "최대 재시작 횟수 초과 - 관리자 알림 필요"
                # 여기에 관리자 알림 로직 추가 가능 (이메일, 슬랙 등)
            fi
        else
            log "PM2는 정상이지만 서버 응답 없음 - 추가 조사 필요"
        fi
    else
        log "서버 정상 작동 중"
        reset_restart_count
    fi
}

# 스크립트 실행
main 