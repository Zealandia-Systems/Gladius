import React, { PureComponent } from 'react';
import ReactTooltip from 'react-tooltip';
import Header from './Header';
import Workspace from './Workspace';
import styles from './App.styl';

class App extends PureComponent {
    static propTypes = {

    };

    render() {
        return (
            <div>
                <ReactTooltip
                    delayShow={1000}
                    effect="solid"
                />
                <Header {...this.props} />
                <div className={styles.main}>
                    <div className={styles.content}>
                        <Workspace
                            {...this.props}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
